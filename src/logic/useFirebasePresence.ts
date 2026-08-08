import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { db } from './firebaseConfig';

const detectMobileDevice = (): 'phone' | 'desktop' => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  return isMobileUA || isSmallScreen ? 'phone' : 'desktop';
};

// Added deviceId as a required parameter here
export function useFirebasePresence(roomId: string, deviceName: string, deviceId: string) {
  useEffect(() => {
    if (!roomId || !db || !deviceId) return;

    const deviceType = detectMobileDevice();
    const cleanName = deviceName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim() || (deviceType === 'phone' ? 'Mobile Device' : 'Desktop Device');

    const connectedRef = ref(db, '.info/connected');
    const presenceRef = ref(db, `rooms/${roomId}/presence/${deviceId}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(presenceRef).set({
          status: 'offline',
          lastActive: serverTimestamp(),
          name: cleanName,
          type: deviceType
        });

        set(presenceRef, {
          status: 'online',
          lastActive: serverTimestamp(),
          name: cleanName,
          type: deviceType
        });
      }
    });

    return () => {
      unsubscribe();
      set(presenceRef, {
        status: 'offline',
        lastActive: serverTimestamp(),
        name: cleanName,
        type: deviceType
      });
    };
  }, [roomId, deviceName, deviceId]);
}