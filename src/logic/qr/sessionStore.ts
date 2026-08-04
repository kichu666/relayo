import { atom, map } from 'nanostores';

export type SessionState =
  | 'IDLE'
  | 'GENERATING'
  | 'WAITING_FOR_SCAN'
  | 'PEER_SCANNED'
  | 'HANDSHAKING'
  | 'VERIFYING_SAS'
  | 'CONNECTED'
  | 'EXPIRED'
  | 'ERROR';

export type PairingMode = 'ephemeral' | 'trusted';

export interface DeviceMetadata {
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export type TransferRole = 'sender' | 'receiver';
export type TransferRoleMode = 'sending' | 'receiving' | 'idle';
export type TransferStatus = 'idle' | 'sending' | 'receiving' | 'sent_completed' | 'received_completed' | 'error';

export interface FileTransferProgress {
  role: TransferRole;
  transferRole: TransferRoleMode;
  status: TransferStatus;
  fileName: string;
  fileSize: number;
  bytesTransferred: number;
  progressPercent: number;
  transferSpeedMbps: number;
  downloadUrl?: string | null;
  errorMessage?: string | null;
}

export interface SessionData {
  state: SessionState;
  pairingMode: PairingMode;
  sessionId: string | null;
  sessionPin: string | null;
  qrPayloadUrl: string | null;
  expiresAt: number | null;
  localPublicKeyHex: string | null;
  peerPublicKeyHex: string | null;
  sasEmojis: string[] | null;
  sasVerified: boolean;
  peerMetadata: DeviceMetadata | null;
  transport: 'direct-p2p' | 'turn-relay' | null;
  rttPingMs: number | null;
  errorMessage: string | null;
  connectionToast: string | null;
}

export const $sessionStore = map<SessionData>({
  state: 'IDLE',
  pairingMode: 'ephemeral',
  sessionId: null,
  sessionPin: null,
  qrPayloadUrl: null,
  expiresAt: null,
  localPublicKeyHex: null,
  peerPublicKeyHex: null,
  sasEmojis: null,
  sasVerified: false,
  peerMetadata: null,
  transport: null,
  rttPingMs: null,
  errorMessage: null,
  connectionToast: null,
});

export const $transferStore = map<FileTransferProgress>({
  role: 'sender',
  transferRole: 'idle',
  status: 'idle',
  fileName: '',
  fileSize: 0,
  bytesTransferred: 0,
  progressPercent: 0,
  transferSpeedMbps: 0,
  downloadUrl: null,
  errorMessage: null,
});

export const $trustedDevices = atom<DeviceMetadata[]>([]);

export function triggerConnectionToast(message: string) {
  $sessionStore.setKey('connectionToast', message);
  setTimeout(() => {
    $sessionStore.setKey('connectionToast', null);
  }, 4000);
}

/**
 * Write session sync flag to localStorage for instant local pairing sync
 */
export function syncPairingStateToLocalStorage(sessionId: string) {
  try {
    localStorage.setItem('relayo_paired_session', sessionId);
    localStorage.setItem('relayo_paired_timestamp', Date.now().toString());
  } catch (e) {
    // ignore
  }
}

export function clearPairingStateLocalStorage() {
  try {
    localStorage.removeItem('relayo_paired_session');
    localStorage.removeItem('relayo_paired_timestamp');
  } catch (e) {
    // ignore
  }
}

export function detectLocalDeviceMetadata(): DeviceMetadata {
  const ua = navigator.userAgent;
  let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/mobile/i.test(ua)) type = 'mobile';
  else if (/ipad|tablet/i.test(ua)) type = 'tablet';

  let browser = 'Browser';
  if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';

  let os = 'OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  const name = `${os} (${browser})`;

  return { name, type, browser, os };
}
