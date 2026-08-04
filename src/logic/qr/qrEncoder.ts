import type { PairingMode } from './sessionStore';

export interface ParsedQRPayload {
  sessionId: string;
  publicKeyHex: string;
  pin: string;
  pairingMode: PairingMode;
  nonce: string;
}

/**
 * Format QR Code Pairing Payload URL using URL Hash Fragment `#`
 * Hash fragment ensures cryptographic tokens are NEVER sent in HTTP headers to server logs.
 */
export function buildQRPayloadUrl(
  sessionId: string,
  publicKeyHex: string,
  pin: string,
  pairingMode: PairingMode = 'ephemeral'
): string {
  const nonce = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  const baseUrl = window.location.origin + window.location.pathname;
  
  const hashParams = new URLSearchParams({
    s: sessionId,
    pk: publicKeyHex,
    p: pin,
    m: pairingMode,
    n: nonce
  });

  return `${baseUrl}#pair?${hashParams.toString()}`;
}

/**
 * Parse pairing payload parameters from scanned string or current URL hash fragment
 */
export function parseQRPayloadUrl(rawUrlOrHash: string): ParsedQRPayload | null {
  try {
    let hashContent = rawUrlOrHash;
    if (rawUrlOrHash.includes('#pair?')) {
      hashContent = rawUrlOrHash.split('#pair?')[1];
    } else if (rawUrlOrHash.includes('?')) {
      hashContent = rawUrlOrHash.split('?')[1];
    }

    const params = new URLSearchParams(hashContent);
    const sessionId = params.get('s');
    const publicKeyHex = params.get('pk');
    const pin = params.get('p') || '000000';
    const mode = (params.get('m') as PairingMode) || 'ephemeral';
    const nonce = params.get('n') || '';

    if (!sessionId || !publicKeyHex) {
      return null;
    }

    return {
      sessionId,
      publicKeyHex,
      pin,
      pairingMode: mode,
      nonce
    };
  } catch (err) {
    console.error('Failed to parse QR code payload:', err);
    return null;
  }
}
