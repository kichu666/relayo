import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { db } from './firebaseConfig';

export function useFirebasePresence(roomId: string, deviceName: string) {
  useEffect(() => {
    if (!roomId || !db) return;

    // Use sessionStorage and crypto.randomUUID() so individual tabs don't collide
    let deviceId = sessionStorage.getItem('relayo_session_device_id');
    if (!deviceId) {
      deviceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'dev_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('relayo_session_device_id', deviceId);
    }

    const connectedRef = ref(db, '.info/connected');
    const presenceRef = ref(db, `rooms/${roomId}/presence/${deviceId}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Set up disconnect handler FIRST
        onDisconnect(presenceRef).set({
          status: 'offline',
          lastActive: serverTimestamp(),
          name: deviceName,
          type: 'Desktop'
        });

        // Write online state immediately
        set(presenceRef, {
          status: 'online',
          lastActive: serverTimestamp(),
          name: deviceName,
          type: 'Desktop'
        });
      }
    });

    return () => {
      unsubscribe();
      set(presenceRef, {
        status: 'offline',
        lastActive: serverTimestamp(),
        name: deviceName,
        type: 'Desktop'
      });
    };
  }, [roomId, deviceName]);
}
