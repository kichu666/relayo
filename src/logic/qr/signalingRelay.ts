import { $sessionStore, triggerConnectionToast } from './sessionStore';

/**
 * Lightweight Clean Direct Signaling Relay (No heavy auto-polling or complex loops)
 */
class DirectSignalingRelay {
  private channel: BroadcastChannel | null = null;
  private currentSessionId: string | null = null;

  constructor() {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('relayo_direct_p2p');
      this.channel.onmessage = (event) => this.handleMessage(event.data);
    }
  }

  public reset(): void {
    this.currentSessionId = null;
  }

  public registerSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  public postPairingConfirmation(sessionId: string): void {
    if (this.channel) {
      this.channel.postMessage({ type: 'PAIR_CONFIRMED', sessionId });
    }
    try {
      localStorage.setItem('relayo_paired_session', sessionId);
    } catch (e) {
      // ignore
    }
  }

  private handleMessage(data: any): void {
    if (data && data.type === 'PAIR_CONFIRMED' && data.sessionId === this.currentSessionId) {
      $sessionStore.setKey('sasVerified', true);
      $sessionStore.setKey('state', 'CONNECTED');
      triggerConnectionToast('Peer device confirmed pairing connection.');
    }
  }
}

export const signalingRelay = new DirectSignalingRelay();
