// WebCrypto ECDH & SAS Cryptographic Engine for Relayo QR Pairing

const EMOJI_DICTIONARY = [
  '🚀', '⚡', '🛡️', '💎', '🔑', '🦊', '🌌', '🔥', 
  '🌊', '🎯', '🔮', '🛰️', '🛸', '⭐', '🦁', '👑', 
  '🪐', '🌈', '🎨', '🧩', '⚓', '☘️', '⛵', '🏆'
];

export interface KeyPairResult {
  keyPair: CryptoKeyPair;
  publicKeyHex: string;
}

/**
 * Generate an ephemeral ECDH P-256 key pair for zero-knowledge session handshaking
 */
export async function generateEphemeralKeyPair(): Promise<KeyPairResult> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const rawPubKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyHex = Array.from(new Uint8Array(rawPubKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { keyPair, publicKeyHex };
}

/**
 * Import a peer's public key from hex string format
 */
export async function importPeerPublicKey(publicKeyHex: string): Promise<CryptoKey> {
  const match = publicKeyHex.match(/.{1,2}/g);
  if (!match) throw new Error('Invalid public key format');
  const bytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

  return await window.crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    []
  );
}

/**
 * Derive AES-GCM shared key from local private key and peer's public key
 */
export async function deriveSharedSecretKey(
  localPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey
): Promise<CryptoKey> {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: peerPublicKey
    },
    localPrivateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Compute Short Authentication String (SAS) 4-emoji matrix from derived shared key
 */
export async function deriveSasEmojis(sharedKey: CryptoKey): Promise<string[]> {
  const rawBits = await window.crypto.subtle.exportKey('raw', sharedKey);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', rawBits);
  const hashArray = new Uint8Array(hashBuffer);

  const emojis: string[] = [];
  for (let i = 0; i < 4; i++) {
    const byte = hashArray[i];
    const index = byte % EMOJI_DICTIONARY.length;
    emojis.push(EMOJI_DICTIONARY[index]);
  }

  return emojis;
}

/**
 * Generate a cryptographically secure random session ID (PIN format & UUID)
 */
export function generateSessionId(): { id: string; pin: string } {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const id = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  
  // 6-digit numeric fallback PIN for manual entry
  const pin = (100000 + (array[0] * 256 + array[1]) % 900000).toString();
  return { id, pin };
}
