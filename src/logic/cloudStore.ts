import { atom } from 'nanostores';
import { db, storage } from './firebaseConfig';
import {
  ref,
  set,
  onValue,
  onDisconnect,
  push,
  remove,
  serverTimestamp,
  off,
  get
} from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

export interface CloudDevice {
  id: string;
  name: string;
  type: 'desktop' | 'phone' | 'laptop' | 'tablet';
  status: 'online' | 'offline';
  lastActive: number;
  platform?: string;
  browser?: string;
}

export interface ClipboardItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface LinkItem {
  id: string;
  senderId: string;
  senderName: string;
  url: string;
  note?: string;
  timestamp: number;
}

export interface ScreenshotItem {
  id: string;
  senderId: string;
  senderName: string;
  imageUrl: string;
  timestamp: number;
  title?: string;
}

export interface CloudState {
  roomId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'phone' | 'laptop' | 'tablet';
  isConnected: boolean;
  devices: CloudDevice[];
  clipboards: ClipboardItem[];
  links: LinkItem[];
  scratchpad: { text: string; lastUpdatedBy: string; updatedAt: number };
  screenshots: ScreenshotItem[];
  toast: { message: string; type: 'info' | 'success' | 'warn'; id: number } | null;
  activeTab: 'p2p' | 'cloud';
  cloudSubTab: 'presence' | 'clipboard' | 'link' | 'scratchpad' | 'screenshot';
}

// Helpers for initial identity setup
const getStoredOrGeneratedId = (key: string, prefix: string) => {
  let val = localStorage.getItem(key);
  if (!val) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      val = `${prefix}_${crypto.randomUUID().substring(0, 8)}`;
    } else {
      val = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    localStorage.setItem(key, val);
  }
  return val;
};

const detectDeviceType = (): 'desktop' | 'phone' | 'laptop' | 'tablet' => {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'phone';
  }
  return 'desktop';
};

const detectDefaultName = (): string => {
  const type = detectDeviceType();
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isWin = navigator.platform.toUpperCase().indexOf('WIN') >= 0;
  const os = isMac ? 'Mac' : isWin ? 'Windows' : 'Device';

  if (type === 'phone') return 'Mobile Phone';
  if (type === 'tablet') return 'Tablet';
  return `${os} ${type === 'laptop' ? 'Laptop' : 'Desktop'}`;
};

export const generateRandomRoomId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `relayo-${rand}`;
};

const initialDeviceId = getStoredOrGeneratedId('relayo_cloud_device_id', 'dev');
const initialDeviceName = localStorage.getItem('relayo_cloud_device_name') || detectDefaultName();
const initialRoomId = localStorage.getItem('relayo_cloud_room_id') || generateRandomRoomId();
const initialDeviceType = detectDeviceType();

export const $cloudStore = atom<CloudState>({
  roomId: initialRoomId,
  deviceId: initialDeviceId,
  deviceName: initialDeviceName,
  deviceType: initialDeviceType,
  isConnected: false,
  devices: [],
  clipboards: [],
  links: [],
  scratchpad: { text: '', lastUpdatedBy: '', updatedAt: Date.now() },
  screenshots: [],
  toast: null,
  activeTab: 'cloud',
  cloudSubTab: 'presence'
});

let cloudToastTimeoutHandle: ReturnType<typeof setTimeout> | null = null;

// Toast notification trigger with auto-dismiss after 2500ms
export const triggerCloudToast = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
  if (cloudToastTimeoutHandle) {
    clearTimeout(cloudToastTimeoutHandle);
  }
  $cloudStore.set({
    ...$cloudStore.get(),
    toast: { message, type, id: Date.now() }
  });
  cloudToastTimeoutHandle = setTimeout(() => {
    $cloudStore.set({
      ...$cloudStore.get(),
      toast: null
    });
    cloudToastTimeoutHandle = null;
  }, 2500);
};

let heartbeatInterval: any = null;
let currentUnsubscribes: Array<() => void> = [];

// Initialize Firebase Realtime Listeners for current Room ID
export const initCloudSession = (roomIdToJoin?: string) => {
  const state = $cloudStore.get();

  // Check URL parameters first, then manual input, then storage, then random fallback
  let urlRoom = '';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    urlRoom = params.get('room') || '';
  }

  const roomId = roomIdToJoin || urlRoom || state.roomId || localStorage.getItem('relayo_cloud_room_id') || generateRandomRoomId();

  localStorage.setItem('relayo_cloud_room_id', roomId);

  // Clean up previous listeners & heartbeat
  currentUnsubscribes.forEach(unsub => unsub());
  currentUnsubscribes = [];
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  const selfDevice: CloudDevice = {
    id: state.deviceId,
    name: state.deviceName,
    type: state.deviceType,
    status: 'online',
    lastActive: Date.now(),
    platform: navigator.platform
  };

  // FORCE state update immediately so roomId matches across the whole app
  $cloudStore.set({
    ...state,
    roomId,
    devices: [selfDevice],
    clipboards: [],
    links: [],
    scratchpad: { text: '', lastUpdatedBy: '', updatedAt: Date.now() },
    screenshots: []
  });

  if (!db) {
    console.warn('[Relayo Cloud] Firebase Realtime Database is not initialized.');
    return;
  }

  // Dynamic Room Presence Reference
  const deviceRef = ref(db, `rooms/${roomId}/presence/${state.deviceId}`);
  const connectedRef = ref(db, '.info/connected');

  // Immediately write presence data to Firebase for the dynamic roomId
  set(deviceRef, selfDevice).catch((err) => {
    console.warn('[Relayo Cloud] Direct presence write notice:', err);
  });

  // Setup presence tracking & onDisconnect for this specific room reference
  const unsubConnected = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      const explicitOnlinePayload: CloudDevice = {
        id: state.deviceId,
        name: state.deviceName,
        type: state.deviceType,
        status: 'online',
        lastActive: Date.now(),
        platform: navigator.platform
      };

      // Explicit online status write
      set(deviceRef, explicitOnlinePayload);

      // Configure onDisconnect to mark status as offline when client disconnects
      onDisconnect(deviceRef).update({
        status: 'offline',
        lastActive: serverTimestamp()
      });

      $cloudStore.set({ ...$cloudStore.get(), isConnected: true });
    } else {
      $cloudStore.set({ ...$cloudStore.get(), isConnected: false });
    }
  });
  currentUnsubscribes.push(() => off(connectedRef));

  // Listen to all devices in the room in real-time
  const presenceRef = ref(db, `rooms/${roomId}/presence`);
  const unsubPresence = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {};
    const devices = Object.keys(data).map(id => ({
      id,
      ...data[id]
    }));

    $cloudStore.set({
      ...$cloudStore.get(),
      devices
    });
  });

  currentUnsubscribes.push(unsubPresence);

  // Initial set
  set(deviceRef, selfDevice).catch(() => { });

  // Heartbeat loop every 10 seconds for dynamic roomId
  heartbeatInterval = setInterval(() => {
    if (db) {
      set(ref(db, `rooms/${roomId}/presence/${state.deviceId}/lastActive`), Date.now());
      set(ref(db, `rooms/${roomId}/presence/${state.deviceId}/status`), 'online');
    }
  }, 10000);

  // Listen to all devices in the room presence node
  const presenceRef = ref(db, `rooms/${roomId}/presence`);
  const unsubDevices = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const deviceList: CloudDevice[] = Object.values(data);
      const now = Date.now();
      let updatedList = deviceList.map(dev => {
        if (dev.id === state.deviceId) {
          return { ...dev, status: 'online' as const };
        }
        if (dev.status === 'online' && now - dev.lastActive > 35000) {
          return { ...dev, status: 'offline' as const };
        }
        return dev;
      });
      if (!updatedList.some(d => d.id === state.deviceId)) {
        updatedList.push(selfDevice);
      }
      $cloudStore.set({ ...$cloudStore.get(), devices: updatedList });
    } else {
      $cloudStore.set({ ...$cloudStore.get(), devices: [selfDevice] });
    }
  });
  currentUnsubscribes.push(() => off(presenceRef));

  // Listen to Clipboard items
  const clipboardRef = ref(db, `rooms/${roomId}/clipboard`);
  const unsubClipboards = onValue(clipboardRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items: ClipboardItem[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.timestamp - a.timestamp);

      const previousCount = $cloudStore.get().clipboards.length;
      if (items.length > previousCount && previousCount > 0) {
        const latest = items[0];
        if (latest.senderId !== state.deviceId) {
          triggerCloudToast(`📋 New Clipboard payload received from ${latest.senderName}`, 'info');
        }
      }
      $cloudStore.set({ ...$cloudStore.get(), clipboards: items });
    } else {
      $cloudStore.set({ ...$cloudStore.get(), clipboards: [] });
    }
  });
  currentUnsubscribes.push(() => off(clipboardRef));

  // Listen to Links
  const linksRef = ref(db, `rooms/${roomId}/links`);
  const unsubLinks = onValue(linksRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items: LinkItem[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.timestamp - a.timestamp);

      const previousCount = $cloudStore.get().links.length;
      if (items.length > previousCount && previousCount > 0) {
        const latest = items[0];
        if (latest.senderId !== state.deviceId) {
          triggerCloudToast(`🔗 Link received from ${latest.senderName}: ${latest.url}`, 'info');
        }
      }
      $cloudStore.set({ ...$cloudStore.get(), links: items });
    } else {
      $cloudStore.set({ ...$cloudStore.get(), links: [] });
    }
  });
  currentUnsubscribes.push(() => off(linksRef));

  // Listen to Scratchpad
  const scratchpadRef = ref(db, `rooms/${roomId}/scratchpad`);
  const unsubScratchpad = onValue(scratchpadRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      $cloudStore.set({ ...$cloudStore.get(), scratchpad: data });
    }
  });
  currentUnsubscribes.push(() => off(scratchpadRef));

  // Listen to Screenshots
  const screenshotsRef = ref(db, `rooms/${roomId}/screenshots`);
  const unsubScreenshots = onValue(screenshotsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items: ScreenshotItem[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => b.timestamp - a.timestamp);

      const previousCount = $cloudStore.get().screenshots.length;
      if (items.length > previousCount && previousCount > 0) {
        const latest = items[0];
        if (latest.senderId !== state.deviceId) {
          triggerCloudToast(`📷 Screenshot received from ${latest.senderName}`, 'info');
        }
      }
      $cloudStore.set({ ...$cloudStore.get(), screenshots: items });
    } else {
      $cloudStore.set({ ...$cloudStore.get(), screenshots: [] });
    }
  });
  currentUnsubscribes.push(() => off(screenshotsRef));
};

// Update Device Name
export const updateDeviceName = (name: string) => {
  const cleanName = name.trim() || 'My Device';
  localStorage.setItem('relayo_cloud_device_name', cleanName);
  const state = $cloudStore.get();
  $cloudStore.set({ ...state, deviceName: cleanName });

  if (db && state.isConnected) {
    set(ref(db, `rooms/${state.roomId}/presence/${state.deviceId}/name`), cleanName);
  }
};

// Switch Cloud Room Code
export const switchCloudRoom = (newRoomId?: any) => {
  const state = $cloudStore.get();

  // Set current device offline in the old room before leaving
  if (db && state.roomId && state.deviceId) {
    set(ref(db, `rooms/${state.roomId}/presence/${state.deviceId}/status`), 'offline').catch(() => { });
  }

  // FIX: Prevent silent crash if a UI event object is passed instead of a string
  let cleanRoom = '';
  if (typeof newRoomId === 'string') {
    cleanRoom = newRoomId.trim();
  }

  // Fallback to a random room if no valid string was provided
  cleanRoom = cleanRoom || generateRandomRoomId();

  // Boot up the real-time listeners for the new room
  initCloudSession(cleanRoom);
};

// Send Clipboard Text
export const sendClipboardPayload = async (text: string) => {
  const state = $cloudStore.get();
  if (!text.trim()) return;
  if (!db) {
    triggerCloudToast('Firebase DB not initialized', 'warn');
    return;
  }

  const newClipRef = push(ref(db, `rooms/${state.roomId}/clipboard`));
  await set(newClipRef, {
    senderId: state.deviceId,
    senderName: state.deviceName,
    text: text.trim(),
    timestamp: Date.now()
  });

  triggerCloudToast('📋 Clipboard synced across cloud devices!', 'success');
};

// Copy text to local device clipboard
export const copyToSystemClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    triggerCloudToast('Copied to local clipboard!', 'success');
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    triggerCloudToast('Copy permission denied', 'warn');
  }
};

// Read local clipboard & push
export const readAndPushSystemClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      await sendClipboardPayload(text);
    } else {
      triggerCloudToast('Clipboard is empty', 'info');
    }
  } catch (err) {
    triggerCloudToast('Clipboard access required. Please paste manually.', 'warn');
  }
};

// Delete clipboard item
export const deleteClipboardItem = async (itemId: string) => {
  const state = $cloudStore.get();
  if (db) {
    await remove(ref(db, `rooms/${state.roomId}/clipboard/${itemId}`));
    triggerCloudToast('Clipboard entry removed', 'info');
  }
};

// Send Link Payload
export const sendLinkPayload = async (rawUrl: string, note?: string) => {
  const state = $cloudStore.get();
  let url = rawUrl.trim();
  if (!url) return;

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  if (!db) return;

  const newLinkRef = push(ref(db, `rooms/${state.roomId}/links`));
  await set(newLinkRef, {
    senderId: state.deviceId,
    senderName: state.deviceName,
    url,
    note: note?.trim() || '',
    timestamp: Date.now()
  });

  triggerCloudToast('🔗 Link pushed to all linked devices!', 'success');
};

// Delete link item
export const deleteLinkItem = async (itemId: string) => {
  const state = $cloudStore.get();
  if (db) {
    await remove(ref(db, `rooms/${state.roomId}/links/${itemId}`));
    triggerCloudToast('Link removed', 'info');
  }
};

// Update Scratchpad Note
export const updateScratchpadNote = async (text: string) => {
  const state = $cloudStore.get();
  if (!db) return;

  const scratchpadRef = ref(db, `rooms/${state.roomId}/scratchpad`);
  await set(scratchpadRef, {
    text,
    lastUpdatedBy: state.deviceName,
    updatedAt: Date.now()
  });
};

// Clear Scratchpad
export const clearScratchpadNote = async () => {
  await updateScratchpadNote('');
  triggerCloudToast('Scratchpad cleared', 'info');
};

// Capture screen screenshot & upload
export const captureAndSendScreenshot = async (title?: string) => {
  const state = $cloudStore.get();
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as any,
      audio: false
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    // Canvas render
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop all media tracks
    stream.getTracks().forEach(track => track.stop());

    // High quality WebP / JPEG base64 data URL
    const dataUrl = canvas.toDataURL('image/webp', 0.85);

    let finalImageUrl = dataUrl;

    // Try Firebase Storage if storage bucket is configured
    if (storage) {
      try {
        const fileRef = storageRef(storage, `screenshots/${state.roomId}/${Date.now()}.webp`);
        await uploadString(fileRef, dataUrl, 'data_url');
        finalImageUrl = await getDownloadURL(fileRef);
      } catch (storageErr) {
        console.warn('Storage upload fallback to direct payload:', storageErr);
      }
    }

    if (db) {
      const newShotRef = push(ref(db, `rooms/${state.roomId}/screenshots`));
      await set(newShotRef, {
        senderId: state.deviceId,
        senderName: state.deviceName,
        imageUrl: finalImageUrl,
        timestamp: Date.now(),
        title: title || `${state.deviceName} Screen Capture`
      });
    }

    triggerCloudToast('📷 Screenshot captured and uploaded to Cloud!', 'success');
  } catch (err: any) {
    if (err.name !== 'NotAllowedError') {
      console.error('Screen capture error:', err);
      triggerCloudToast('Screen capture failed or cancelled', 'warn');
    }
  }
};

// Direct Image Upload for Screenshot module
export const uploadScreenshotFile = async (file: File) => {
  const state = $cloudStore.get();
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string;
    if (dataUrl && db) {
      const newShotRef = push(ref(db, `rooms/${state.roomId}/screenshots`));
      await set(newShotRef, {
        senderId: state.deviceId,
        senderName: state.deviceName,
        imageUrl: dataUrl,
        timestamp: Date.now(),
        title: file.name
      });
      triggerCloudToast('📷 Image uploaded to Cloud!', 'success');
    }
  };
  reader.readAsDataURL(file);
};

// Delete screenshot item
export const deleteScreenshotItem = async (itemId: string) => {
  const state = $cloudStore.get();
  if (db) {
    await remove(ref(db, `rooms/${state.roomId}/screenshots/${itemId}`));
    triggerCloudToast('Screenshot removed', 'info');
  }
};
