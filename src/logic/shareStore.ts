import { map } from 'nanostores';
import { WebRTCManager, FileMetadata, ConnectionState } from './webrtcManager';

export interface LocalMetadataFile {
  index: number;
  name: string;
  size: number;
  mimeType: string;
  rawFile?: File;
  receivedBlob?: Blob;
}

export interface ShareSessionState {
  viewMode: 'home' | 'sender_host' | 'receiver_download';
  shareId: string | null;
  shareUrl: string | null;
  files: LocalMetadataFile[];
  connectionState: ConnectionState;
  statusMessage: string;
  isUploading: boolean;
  uploadProgressPercent: number;
  currentUploadingFileName: string;
  transferSpeed: string;
  bytesTransferred: number;
  totalBytesExpected: number;
  isLoadingInfo: boolean;
  toastMessage: string | null;
}

const initialRoomId = extractRoomIdFromUrl();

export const $shareStore = map<ShareSessionState>({
  viewMode: initialRoomId ? 'receiver_download' : 'home',
  shareId: initialRoomId,
  shareUrl: initialRoomId
    ? `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${typeof window !== 'undefined' ? window.location.host : ''}/?id=${initialRoomId}#share`
    : null,
  files: [],
  connectionState: initialRoomId ? 'connecting_peer' : 'idle',
  statusMessage: initialRoomId ? 'Handshaking with sender room...' : 'Ready',
  isUploading: false,
  uploadProgressPercent: 0,
  currentUploadingFileName: '',
  transferSpeed: '',
  bytesTransferred: 0,
  totalBytesExpected: 0,
  isLoadingInfo: false,
  toastMessage: initialRoomId ? 'Room link detected! Connecting via WebRTC P2P...' : null,
});

let activeRtcManager: WebRTCManager | null = null;

// Track whether receiver session is already being initialized to prevent double-init
let receiverSessionInitializing = false;

// NOTE: Receiver initialization is triggered exclusively by App.tsx useEffect.
// Do NOT auto-init here to avoid a duplicate PeerJS connection race with React's mount cycle.

export function triggerToast(message: string) {
  $shareStore.setKey('toastMessage', message);
  setTimeout(() => {
    $shareStore.setKey('toastMessage', null);
  }, 4000);
}

/**
 * Extract Room ID from search params, hash params, or direct hash strings
 */
export function extractRoomIdFromUrl(urlStr?: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Direct URLSearchParams check on window.location.search (?id=... or ?room=...)
    if (!urlStr && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get('id') || searchParams.get('room') || searchParams.get('share');
      if (id) return id.trim();
    }

    const fullUrl = urlStr || window.location.href;
    if (!fullUrl) return null;

    // 2. Parse query string regex in full URL (?id=... or &id=...)
    const queryMatch = fullUrl.match(/[?&](?:id|room|share)=([^&#]+)/i);
    if (queryMatch && queryMatch[1]) {
      return decodeURIComponent(queryMatch[1]).trim();
    }

    // 3. Parse hash query params (#share?id=... or #id=...)
    const hashMatch = fullUrl.match(/#(?:share|room)?\?[^#]*id=([^&#]+)/i) || fullUrl.match(/#id=([^&#]+)/i);
    if (hashMatch && hashMatch[1]) {
      return decodeURIComponent(hashMatch[1]).trim();
    }

    // 4. Direct hash room ID (#relayo-xxxxxx)
    const directHashMatch = fullUrl.match(/#(relayo-[a-z0-9]+)/i);
    if (directHashMatch && directHashMatch[1]) {
      return directHashMatch[1].trim();
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Reset and destroy existing WebRTC session
 */
export function resetRtcSession() {
  if (activeRtcManager) {
    activeRtcManager.destroy();
    activeRtcManager = null;
  }

  $shareStore.set({
    viewMode: 'home',
    shareId: null,
    shareUrl: null,
    files: [],
    connectionState: 'idle',
    statusMessage: 'Ready',
    isUploading: false,
    uploadProgressPercent: 0,
    currentUploadingFileName: '',
    transferSpeed: '',
    bytesTransferred: 0,
    totalBytesExpected: 0,
    isLoadingInfo: false,
    toastMessage: null,
  });
}

/**
 * Host files on sender device using WebRTC P2P Direct Streaming Architecture
 */
export async function hostFilesOnSender(files: File[]): Promise<string> {
  if (files.length === 0) throw new Error('No files selected');

  resetRtcSession();

  const shareId = 'relayo-' + Math.random().toString(36).substring(2, 8);
  const host = window.location.host;
  const protocol = window.location.protocol;
  const shareUrl = `${protocol}//${host}/?id=${shareId}#share`;

  const metadataList: LocalMetadataFile[] = files.map((file, i) => ({
    index: i,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    rawFile: file,
  }));

  // Update sender address bar query to match share link
  if (typeof window !== 'undefined' && window.history) {
    window.history.replaceState(null, '', `?id=${shareId}#share`);
  }

  $shareStore.set({
    viewMode: 'sender_host',
    shareId,
    shareUrl,
    files: metadataList,
    connectionState: 'connecting_signaling',
    statusMessage: 'Initializing WebRTC signaling...',
    isUploading: false,
    uploadProgressPercent: 0,
    currentUploadingFileName: '',
    isLoadingInfo: false,
    toastMessage: 'Relayo WebRTC P2P share link active! Ready for direct peer download.',
  });

  const rtcManager = new WebRTCManager({
    onStateChange: (state, message) => {
      $shareStore.setKey('connectionState', state);
      if (message) $shareStore.setKey('statusMessage', message);
      if (state === 'connected' || state === 'transferring' || state === 'completed') {
        $shareStore.setKey('isLoadingInfo', false);
      }
    },
    onFileMetadataReceived: () => {},
    onProgress: (percent, currentFile, speedStr, bytesTransferred, totalBytes) => {
      $shareStore.setKey('isUploading', percent < 100);
      $shareStore.setKey('uploadProgressPercent', percent);
      $shareStore.setKey('currentUploadingFileName', currentFile);
      $shareStore.setKey('transferSpeed', speedStr);
      $shareStore.setKey('bytesTransferred', bytesTransferred);
      $shareStore.setKey('totalBytesExpected', totalBytes);
    },
    onFileReceived: () => {},
    onTransferComplete: () => {
      $shareStore.setKey('isUploading', false);
      $shareStore.setKey('uploadProgressPercent', 100);
      triggerToast('P2P Direct File Transfer Completed!');
    },
    onError: (err) => {
      triggerToast(`WebRTC Error: ${err}`);
    },
  });

  activeRtcManager = rtcManager;
  await rtcManager.startSenderSession(shareId, files);

  return shareUrl;
}

/**
 * Load receiver WebRTC session to receive P2P file streams
 */
export async function loadReceiverShareInfo(shareId: string): Promise<void> {
  // Dedupe guard — prevent double-initialization from shareStore auto-call + App.tsx effect
  if (receiverSessionInitializing) {
    console.warn(`[Relayo] loadReceiverShareInfo already initializing for '${shareId}'. Skipping duplicate call.`);
    return;
  }
  receiverSessionInitializing = true;

  // Sanitize shareId: strip whitespace, reject null/'null'/empty
  const cleanShareId = shareId?.trim();
  if (!cleanShareId || cleanShareId === 'null') {
    console.error(`[Relayo] loadReceiverShareInfo called with null/empty shareId: '${shareId}'`);
    receiverSessionInitializing = false;
    return;
  }

  // 1. Properly define shareUrl before it is used
  const receiverShareUrl = `${typeof window !== 'undefined' ? window.location.protocol : 'https:'}//${typeof window !== 'undefined' ? window.location.host : ''}/?id=${cleanShareId}#share`;

  resetRtcSession();

  $shareStore.set({
    viewMode: 'receiver_download',
    shareId: cleanShareId,
    shareUrl: receiverShareUrl,
    files: [],
    connectionState: 'connecting_peer',
    statusMessage: 'Handshaking with sender room...',
    isUploading: false,
    uploadProgressPercent: 0,
    currentUploadingFileName: '',
    isLoadingInfo: true,
    toastMessage: 'Connecting to sender via WebRTC P2P direct stream...',
  });

  const rtcManager = new WebRTCManager({
    onStateChange: (state, message) => {
      $shareStore.setKey('connectionState', state);
      if (message) $shareStore.setKey('statusMessage', message);
      if (state === 'connected' || state === 'transferring' || state === 'completed') {
        $shareStore.setKey('isLoadingInfo', false);
      }
    },
    onFileMetadataReceived: (metadataList: FileMetadata[]) => {
      const files: LocalMetadataFile[] = metadataList.map((f) => ({
        index: f.index,
        name: f.name,
        size: f.size,
        mimeType: f.mimeType,
      }));

      $shareStore.setKey('files', files);
      $shareStore.setKey('isLoadingInfo', false);
      $shareStore.setKey('connectionState', 'connected');
      $shareStore.setKey('statusMessage', 'WebRTC Direct Stream Active! Shared Files Ready.');
      triggerToast(`Loaded ${files.length} shared files from sender! WebRTC P2P stream ready.`);
    },
    onProgress: (percent, currentFile, speedStr, bytesTransferred, totalBytes) => {
      $shareStore.setKey('uploadProgressPercent', percent);
      $shareStore.setKey('currentUploadingFileName', currentFile);
      $shareStore.setKey('transferSpeed', speedStr);
      $shareStore.setKey('bytesTransferred', bytesTransferred);
      $shareStore.setKey('totalBytesExpected', totalBytes);
    },
    onFileReceived: (index: number, blob: Blob) => {
      const currentFiles = $shareStore.get().files;
      const updatedFiles = currentFiles.map((f) =>
        f.index === index ? { ...f, receivedBlob: blob } : f
      );
      $shareStore.setKey('files', updatedFiles);
      triggerToast(`Received file #${index + 1}: ${blob.size} bytes`);
    },
    onTransferComplete: () => {
      $shareStore.setKey('uploadProgressPercent', 100);
      triggerToast('All WebRTC direct P2P files received successfully!');
    },
    onError: (err) => {
      $shareStore.setKey('isLoadingInfo', false);
      $shareStore.setKey('connectionState', 'error');
      $shareStore.setKey('statusMessage', `Connection error: ${err}`);
      triggerToast(`WebRTC Receiver Error: ${err}`);
    },
  });

  activeRtcManager = rtcManager;

  try {
    await rtcManager.startReceiverSession(cleanShareId);
  } catch (err: any) {
    console.error('[Relayo] startReceiverSession crashed:', err);
    $shareStore.setKey('isLoadingInfo', false);
    $shareStore.setKey('connectionState', 'error');
    $shareStore.setKey('statusMessage', `Failed to initialize receiver: ${err?.message || String(err)}`);
    triggerToast(`Receiver initialization error: ${err?.message || String(err)}`);
  } finally {
    receiverSessionInitializing = false;
  }
}

/**
 * Get active WebRTC manager instance
 */
export function getActiveRtcManager(): WebRTCManager | null {
  return activeRtcManager;
}
