/**
 * Relayo Zero-Memory WebRTC P2P Direct Streaming Engine powered by PeerJS Cloud Signaling
 * 
 * Features:
 * 1. Global PeerJS Cloud Signaling: Uses PeerJS free cloud signaling servers (0.peerjs.com) for SDP offer/answer exchange & NAT traversal.
 * 2. Sender Logic:
   - Initializes `new Peer(roomId)` using room ID from share URL.
   - Listens for `peer.on('connection', (conn) => ...)`
   - On `conn.on('open')`, immediately transmits file metadata payload (`name`, `size`, `type`) over `conn.send()`.
 * 3. Receiver Logic:
   - Initializes client `new Peer()`.
   - Connects directly to sender via `peer.connect(targetRoomId)`.
   - On `conn.on('data')`, parses metadata payload, updates "Available Shared Files" UI state, and unmounts loading spinner.
 * 4. Actionable Error Handling:
   - Catches `peer.on('error')` (e.g. `peer-unavailable`, `unavailable-id`, network offline) and reports actionable UI error messages, stopping infinite loading loops.
 */

import Peer, { DataConnection } from 'peerjs';

export interface FileMetadata {
  index: number;
  name: string;
  size: number;
  mimeType: string;
  type?: string;
}

export type ConnectionState =
  | 'idle'
  | 'connecting_signaling'
  | 'waiting_for_peer'
  | 'connecting_peer'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'error'
  | 'disconnected';

export interface WebRTCManagerCallbacks {
  onStateChange: (state: ConnectionState, message?: string) => void;
  onFileMetadataReceived: (files: FileMetadata[]) => void;
  onProgress: (
    percent: number,
    currentFile: string,
    speedStr: string,
    bytesTransferred: number,
    totalBytes: number
  ) => void;
  onFileReceived: (index: number, blob: Blob) => void;
  onTransferComplete: () => void;
  onError: (error: string) => void;
}

export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.services.mozilla.com:3478' },
];

const CHUNK_SIZE = 64 * 1024; // 64KB optimal chunk size for high-speed WebRTC DataChannel streaming
const HIGH_WATERMARK = 1024 * 1024; // 1MB buffer threshold before pausing
const LOW_WATERMARK = 256 * 1024; // 256KB buffer threshold to resume

export class WebRTCManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private role: 'sender' | 'receiver' | null = null;
  private roomId: string | null = null;
  private callbacks: WebRTCManagerCallbacks;

  private filesToHost: File[] = [];
  private fileMetadataList: FileMetadata[] = [];

  // Transfer speed & progress metrics
  private transferStartTime: number = 0;
  private lastSpeedCalcTime: number = 0;
  private lastSpeedBytes: number = 0;
  private currentSpeedStr: string = '0 KB/s';

  // Receiver state
  private receivedBlobs: Map<number, Blob> = new Map();
  private currentFileIndex: number = -1;
  private currentFileChunks: ArrayBuffer[] = [];
  private totalBytesReceivedAllFiles: number = 0;
  private totalBytesExpectedAllFiles: number = 0;

  constructor(callbacks: WebRTCManagerCallbacks) {
    this.callbacks = callbacks;
  }

  private reportError(category: string, errMessage: string) {
    console.error(`[Relayo PeerJS ERROR] [${category}] ${errMessage}`);
    this.callbacks.onError(errMessage);
    this.callbacks.onStateChange('error', errMessage);
  }

  /**
   * Sender Logic:
   * - Initialize `new Peer(roomId)` using fixed room ID.
   * - Listen for incoming connections `peer.on('connection', (conn) => ...)`.
   * - On `conn.on('open')`, immediately transmit metadata payload over `conn.send()`.
   */
  public async startSenderSession(shareId: string, files: File[]): Promise<void> {
    this.role = 'sender';
    this.roomId = shareId;
    this.filesToHost = files;

    console.log(`[Relayo PeerJS SENDER] Initializing host peer with ID: ${shareId}`);

    this.fileMetadataList = files.map((f, idx) => ({
      index: idx,
      name: f.name,
      size: f.size,
      mimeType: f.type || 'application/octet-stream',
      type: f.type || 'application/octet-stream',
    }));

    this.callbacks.onStateChange('waiting_for_peer', 'Ready');

    // 2. Guard against null/empty share ID before instantiating Peer
    if (!shareId || shareId === 'null' || shareId.trim() === '') {
      this.reportError('Invalid Room ID', 'Share ID is invalid.');
      return;
    }

    try {
      if (this.peer) this.peer.destroy();

      // 1. Explicit secure cloud parameters - prevents WS frame drops & rate-limit fallback
      const peer = new Peer(shareId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        path: '/',
        debug: 1,
        config: {
          iceServers: DEFAULT_ICE_SERVERS,
        },
      });

      this.peer = peer;

      peer.on('open', (id) => {
        console.log(`[Relayo PeerJS SENDER] Host peer opened on 0.peerjs.com with ID: ${id}`);
        this.callbacks.onStateChange('waiting_for_peer', 'Ready');
      });

      peer.on('connection', (conn) => {
        console.log(`[Relayo Sender] A receiver is connecting! (peer: ${conn.peer})`);
        this.conn = conn;

        conn.on('open', () => {
          console.log("[Relayo Sender] Data channel open. Sending metadata...");
          conn.send({ type: 'FILE_METADATA', files: this.fileMetadataList });
          conn.send({ type: 'FILE_METADATA_LIST', files: this.fileMetadataList });
        });

        this.setupDataConnection(conn);
      });

      peer.on('disconnected', () => {
        console.warn(`[Relayo PeerJS SENDER] Peer disconnected from signaling. Reconnecting...`);
        try { peer.reconnect(); } catch { /* ignore */ }
      });

      // 3. Comprehensive error handler for all known PeerJS server errors
      peer.on('error', (err) => {
        console.error(`[Relayo PeerJS SENDER ERROR] type='${err.type}':`, err.message);
        if (err.type === 'unavailable-id') {
          this.reportError('Room ID Conflict', `Room ID '${shareId}' is already in use. Please create a new share link.`);
        } else if (err.type === 'invalid-id') {
          this.reportError('Invalid Room ID', `Room ID '${shareId}' contains invalid characters.`);
        } else if (err.type === 'server-error') {
          this.reportError('PeerJS Server Error', 'PeerJS signaling server is unreachable. Check your network.');
        } else if (err.type === 'socket-error' || err.type === 'socket-closed') {
          this.reportError('WebSocket Error', 'PeerJS WebSocket connection dropped. Retrying...');
        } else if (err.type === 'network') {
          this.reportError('Network Error', 'Network unreachable. Check your connection and try again.');
        } else {
          this.reportError('PeerJS Error', err.message || err.type);
        }
      });
    } catch (err: any) {
      this.reportError('PeerJS Host Initialization', err.message || String(err));
    }
  }

  /**
   * Receiver Logic:
   * - Safely extract targetRoomId from URL search params (?id=...) as primary source of truth.
   * - Initialize receiver peer with NO ID argument so PeerJS assigns a random local ID.
   * - Connect to sender only AFTER peer.on('open') fires, using the verified targetRoomId.
   */
  public async startReceiverSession(shareId: string): Promise<void> {
    this.role = 'receiver';

    // 1. Safely grab the target room ID from URL search params — primary source of truth
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('id') || params.get('room') || params.get('share');

    // Prefer the URL param, fall back to the passed shareId argument
    const targetRoomId = (urlRoomId?.trim() && urlRoomId.trim() !== 'null')
      ? urlRoomId.trim()
      : (shareId?.trim() && shareId.trim() !== 'null' ? shareId.trim() : null);

    console.log('[Relayo] Target Room ID from URL search params:', urlRoomId);
    console.log('[Relayo] Target Room ID resolved (final):', targetRoomId);

    if (!targetRoomId) {
      console.error('[Relayo Error] Missing or null ?id= in URL. Cannot connect to sender.');
      this.reportError('Invalid Share Link', 'Room ID is missing from the share link. Please ask the sender for a new link.');
      return;
    }

    this.roomId = targetRoomId;
    this.totalBytesReceivedAllFiles = 0;
    this.totalBytesExpectedAllFiles = 0;
    this.transferStartTime = 0;
    this.lastSpeedCalcTime = 0;
    this.lastSpeedBytes = 0;
    this.currentSpeedStr = '0 KB/s';
    this.receivedBlobs = new Map();
    this.currentFileChunks = [];
    this.currentFileIndex = -1;
    this.callbacks.onStateChange('connecting_peer', 'Connecting...');

    try {
      if (this.peer) this.peer.destroy();

      // 2. Initialize receiver peer with NO ID argument — PeerJS auto-assigns a random local ID
      const peer = new Peer({
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        path: '/',
        debug: 1,
        config: {
          iceServers: DEFAULT_ICE_SERVERS,
        },
      });

      this.peer = peer;

      // 3. Connect to sender INSIDE peer.on('open') after we have a valid local ID
      peer.on('open', (localId) => {
        console.log(`[Relayo] Receiver peer opened with local ID: ${localId}. Connecting to sender '${targetRoomId}'...`);

        if (this.conn && (this.conn.open || (this.conn as any).dataChannel?.readyState === 'open')) {
          console.log('[Relayo] DataConnection already open, skipping duplicate connect.');
          return;
        }

        this.callbacks.onStateChange('connecting_peer', 'Connecting...');

        // Connect to the sender using the clean, verified target room ID
        const conn = peer.connect(targetRoomId, { reliable: true });
        this.conn = conn;
        this.setupDataConnection(conn);
      });

      peer.on('disconnected', () => {
        console.warn(`[Relayo PeerJS RECEIVER] Peer disconnected from signaling. Reconnecting...`);
        try { peer.reconnect(); } catch { /* ignore */ }
      });

      peer.on('error', (err) => {
        console.error(`[Relayo Peer Error] type='${err.type}':`, err.message);
        if (err.type === 'peer-unavailable') {
          this.reportError('Sender Offline', `The sender has left or room '${targetRoomId}' is invalid. Ask the sender to reshare.`);
        } else if (err.type === 'invalid-id') {
          this.reportError('Invalid Room ID', `Room ID '${targetRoomId}' is malformed. Please request a new share link.`);
        } else if (err.type === 'server-error') {
          this.reportError('PeerJS Server Error', 'PeerJS signaling server is unreachable. Check your network.');
        } else if (err.type === 'socket-error' || err.type === 'socket-closed') {
          this.reportError('WebSocket Error', 'PeerJS WebSocket connection dropped. Check your network.');
        } else if (err.type === 'network') {
          this.reportError('Network Error', 'Network unreachable. Check your connection and try again.');
        } else {
          this.reportError('PeerJS Error', err.message || err.type);
        }
      });
    } catch (err: any) {
      this.reportError('Receiver Initialization', err.message || String(err));
    }
  }

  /**
   * DataConnection setup for Sender & Receiver DataChannel messaging
   * Handshake protocol:
   *   1. Sender open  → sends FILE_METADATA_LIST
   *   2. Receiver open → sends REQUEST_METADATA (belt-and-suspenders)
   *   3. Sender receives REQUEST_METADATA → re-sends FILE_METADATA_LIST + starts file stream
   *   4. Receiver receives FILE_METADATA_LIST → updates UI, clears loading spinner
   */
  private setupDataConnection(conn: DataConnection) {
    this.callbacks.onStateChange('connecting_peer', 'Handshaking...');

    // Monitor native RTCPeerConnection ICE state transitions and log fallback diagnostics
    const pc = (conn as any).peerConnection as RTCPeerConnection | undefined;
    if (pc) {
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`[Relayo ICE State] Peer: ${conn.peer} -> State: ${state}`);
        if (state === 'failed') {
          console.warn('[Relayo ICE Fallback] Direct P2P negotiation failed due to restrictive NAT/Firewall.');
          this.reportError('P2P Connection Failed', 'Direct P2P connection blocked by network or firewall restrictions.');
        } else if (state === 'disconnected') {
          console.warn('[Relayo ICE Warning] ICE connection temporarily disconnected. Attempting ICE candidate recovery...');
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[Relayo WebRTC Connection State] Peer: ${conn.peer} -> State: ${pc.connectionState}`);
      };

      pc.onicecandidateerror = (event: any) => {
        console.warn(`[Relayo ICE Candidate Error] host: ${event.address}, code: ${event.errorCode}, text: ${event.errorText}`);
      };
    }

    let hasTriggeredOpen = false;

    const handleOpen = () => {
      if (hasTriggeredOpen) return;
      hasTriggeredOpen = true;

      console.log(`[Relayo] DataChannel OPEN with peer: ${conn.peer}. Role: ${this.role}`);
      this.callbacks.onStateChange('connected', 'P2P Connected');

      if (this.role === 'sender') {
        // Step 1: Sender immediately sends metadata on open
        const metadataPayload = {
          type: 'FILE_METADATA_LIST',
          files: this.fileMetadataList,
        };
        console.log(`[Relayo SENDER] Sending FILE_METADATA_LIST (${this.fileMetadataList.length} files) to receiver...`);
        conn.send(metadataPayload);
        // Note: file streaming starts ONLY after receiver sends REQUEST_METADATA (see handleConnectionData)
      } else if (this.role === 'receiver') {
        // Step 2: Receiver requests metadata (belt-and-suspenders in case sender didn't auto-send)
        console.log(`[Relayo RECEIVER] DataChannel open. Sending REQUEST_METADATA to sender...`);
        conn.send({ type: 'REQUEST_METADATA' });
      }
    };

    conn.on('open', handleOpen);

    // Fire immediately if already open (race-condition safety)
    if (conn.open) {
      handleOpen();
    }

    conn.on('data', (data: any) => {
      this.handleConnectionData(data, conn);
    });

    conn.on('close', () => {
      console.log(`[Relayo] DataChannel closed with peer: ${conn.peer}`);
      this.callbacks.onStateChange('disconnected', 'P2P Connection closed.');
    });

    conn.on('error', (err: any) => {
      console.error(`[Relayo] DataChannel error:`, err);
      this.reportError('DataConnection Error', err.message || String(err));
    });
  }

  /**
   * Helper: Calculate real-time transfer speed (MB/s or KB/s) and trigger onProgress callback
   */
  private updateTransferMetrics(bytesTransferred: number, totalBytes: number, currentFileName: string) {
    const now = performance.now();
    if (!this.transferStartTime) {
      this.transferStartTime = now;
      this.lastSpeedCalcTime = now;
      this.lastSpeedBytes = bytesTransferred;
    }

    const timeDiff = (now - this.lastSpeedCalcTime) / 1000;
    // Calculate speed every 250ms or when complete
    if (timeDiff >= 0.25 || (totalBytes > 0 && bytesTransferred >= totalBytes)) {
      const bytesDiff = bytesTransferred - this.lastSpeedBytes;
      const bytesPerSec = timeDiff > 0 ? bytesDiff / timeDiff : 0;

      if (bytesPerSec >= 1024 * 1024) {
        this.currentSpeedStr = `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
      } else if (bytesPerSec >= 1024) {
        this.currentSpeedStr = `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
      } else {
        this.currentSpeedStr = `${Math.round(bytesPerSec)} B/s`;
      }

      this.lastSpeedCalcTime = now;
      this.lastSpeedBytes = bytesTransferred;
    }

    const percent = totalBytes > 0 ? Math.min(100, Math.round((bytesTransferred / totalBytes) * 100)) : 0;
    this.callbacks.onProgress(percent, currentFileName, this.currentSpeedStr, bytesTransferred, totalBytes);
  }

  /**
   * Sender: Stream file binary chunks over PeerJS DataConnection
   */
  private async streamFilesToPeer(conn: DataConnection) {
    console.log(`[Relayo PeerJS] Sender starting binary stream of ${this.filesToHost.length} files...`);
    this.callbacks.onStateChange('transferring', 'Streaming files browser-to-browser...');

    const totalAllFilesBytes = this.filesToHost.reduce((acc, f) => acc + f.size, 0) || 1;
    let totalBytesSent = 0;
    this.transferStartTime = 0; // reset metrics for new stream

    for (let i = 0; i < this.filesToHost.length; i++) {
      const file = this.filesToHost[i];
      console.log(`[Relayo PeerJS] Sender streaming file #${i + 1}: ${file.name} (${file.size} bytes)`);

      // 1. Send START_FILE control message
      conn.send({
        type: 'START_FILE',
        index: i,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
      });

      // 2. Stream binary ArrayBuffer chunks with event-driven buffer backpressure
      const dc = (conn as any).dataChannel as RTCDataChannel | undefined;
      if (dc) {
        dc.bufferedAmountLowThreshold = LOW_WATERMARK;
      }

      let offset = 0;
      while (offset < file.size) {
        if (dc && dc.bufferedAmount > HIGH_WATERMARK) {
          await new Promise<void>((resolve) => {
            let resolved = false;
            const onLow = () => {
              if (!resolved) {
                resolved = true;
                dc.removeEventListener('bufferedamountlow', onLow);
                resolve();
              }
            };
            dc.addEventListener('bufferedamountlow', onLow);
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                dc.removeEventListener('bufferedamountlow', onLow);
                resolve();
              }
            }, 30);
          });
        }

        const chunkSlice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await chunkSlice.arrayBuffer();

        conn.send(arrayBuffer);
        offset += chunkSlice.size;
        totalBytesSent += chunkSlice.size;

        this.updateTransferMetrics(totalBytesSent, totalAllFilesBytes, file.name);
      }

      // 3. Send END_FILE control message
      conn.send({
        type: 'END_FILE',
        index: i,
      });

      console.log(`[Relayo PeerJS] Finished streaming file #${i + 1}: ${file.name}`);
    }

    // 4. Send TRANSFER_COMPLETE control message
    conn.send({
      type: 'TRANSFER_COMPLETE',
    });

    console.log(`[Relayo PeerJS] All files transferred via PeerJS!`);
    this.callbacks.onStateChange('completed', 'All files transferred via PeerJS WebRTC P2P direct stream!');
    this.callbacks.onTransferComplete();
  }

  /**
   * Receiver: Receive control JSON & binary ArrayBuffers
   * Also handles sender-side REQUEST_METADATA → triggers file stream
   */
  private handleConnectionData(data: any, conn: DataConnection) {
    // --- Normalise: handle both plain objects and JSON strings ---
    let payload: any = null;
    if (typeof data === 'string') {
      try {
        payload = JSON.parse(data);
        console.log(`[Relayo DATA IN] Parsed JSON string payload:`, payload);
      } catch (parseErr) {
        console.error(`[Relayo] JSON parse error:`, parseErr, data);
        return;
      }
    } else if (data instanceof ArrayBuffer) {
      // Binary chunk — accumulate for current file
      this.currentFileChunks.push(data);
      this.totalBytesReceivedAllFiles += data.byteLength;

      const fileMeta = this.fileMetadataList.find((f) => f.index === this.currentFileIndex);
      const fileName = fileMeta ? fileMeta.name : '';

      this.updateTransferMetrics(this.totalBytesReceivedAllFiles, this.totalBytesExpectedAllFiles, fileName);
      return;
    } else if (typeof data === 'object' && data !== null) {
      payload = data;
    } else {
      console.warn('[Relayo] Unknown data type received:', typeof data, data);
      return;
    }

    // --- Route by message type ---
    const type: string = payload.type;
    console.log(`[Relayo DATA IN] Message type: '${type}', role: '${this.role}'`);

    if (type === 'FILE_METADATA' || type === 'FILE_METADATA_LIST' || type === 'FILE_MANIFEST_RESPONSE') {
      // Step 4: Receiver gets metadata → update UI, clear spinner
      if (!Array.isArray(payload.files)) {
        console.error('[Relayo] FILE_METADATA missing files array:', payload);
        return;
      }
      console.log(`[Relayo RECEIVER] ✅ Got ${type} (${payload.files.length} files). Updating UI & clearing spinner!`);
      this.fileMetadataList = payload.files;
      this.totalBytesExpectedAllFiles = payload.files.reduce((acc: number, f: FileMetadata) => acc + f.size, 0);
      this.callbacks.onFileMetadataReceived(payload.files);
      this.callbacks.onStateChange('connected', 'Files ready — click to download!');

    } else if (type === 'REQUEST_METADATA' || type === 'REQUEST_FILE_METADATA') {
      // Step 3: Sender receives REQUEST_METADATA → re-send metadata + start file stream
      if (this.role !== 'sender') return;
      console.log(`[Relayo SENDER] Received REQUEST_METADATA from receiver. Re-sending metadata + starting file stream...`);
      conn.send({ type: 'FILE_METADATA', files: this.fileMetadataList });
      conn.send({ type: 'FILE_METADATA_LIST', files: this.fileMetadataList });
      // Start streaming files now that receiver is ready
      this.streamFilesToPeer(conn);

    } else if (type === 'START_FILE') {
      console.log(`[Relayo RECEIVER] Receiving file #${payload.index + 1}: ${payload.name}`);
      this.currentFileIndex = payload.index;
      this.currentFileChunks = [];

      if (!this.transferStartTime) {
        this.transferStartTime = performance.now();
        this.lastSpeedCalcTime = performance.now();
        this.lastSpeedBytes = this.totalBytesReceivedAllFiles;
      }

      let fileMeta = this.fileMetadataList.find((f) => f.index === payload.index);
      if (!fileMeta && payload.name) {
        fileMeta = {
          index: payload.index,
          name: payload.name,
          size: payload.size || 0,
          mimeType: payload.mimeType || 'application/octet-stream',
        };
        this.fileMetadataList.push(fileMeta);
      }

      if (this.totalBytesExpectedAllFiles === 0 && this.fileMetadataList.length > 0) {
        this.totalBytesExpectedAllFiles = this.fileMetadataList.reduce((acc, f) => acc + f.size, 0);
      }

      const fileName = payload.name || (fileMeta ? fileMeta.name : '');
      this.callbacks.onStateChange('transferring', `Receiving ${fileName}...`);

      const currentPercent = this.totalBytesExpectedAllFiles > 0
        ? Math.min(100, Math.round((this.totalBytesReceivedAllFiles / this.totalBytesExpectedAllFiles) * 100))
        : 0;

      this.callbacks.onProgress(
        currentPercent,
        fileName,
        this.currentSpeedStr || '0 KB/s',
        this.totalBytesReceivedAllFiles,
        this.totalBytesExpectedAllFiles
      );

    } else if (type === 'END_FILE') {
      const fileMeta = this.fileMetadataList.find((f) => f.index === payload.index);
      const mimeType = fileMeta ? fileMeta.mimeType : 'application/octet-stream';
      const blob = new Blob(this.currentFileChunks, { type: mimeType });
      console.log(`[Relayo RECEIVER] Reassembled file #${payload.index + 1}: ${blob.size} bytes`);
      this.receivedBlobs.set(payload.index, blob);
      this.callbacks.onFileReceived(payload.index, blob);
      this.currentFileChunks = [];

    } else if (type === 'TRANSFER_COMPLETE') {
      console.log(`[Relayo RECEIVER] All files received!`);
      const fileMeta = this.fileMetadataList.find((f) => f.index === this.currentFileIndex);
      const fileName = fileMeta ? fileMeta.name : '';
      const finalBytes = this.totalBytesExpectedAllFiles || this.totalBytesReceivedAllFiles;
      this.callbacks.onProgress(
        100,
        fileName,
        this.currentSpeedStr || '0 KB/s',
        finalBytes,
        finalBytes
      );
      this.callbacks.onStateChange('completed', 'Download Complete!');
      this.callbacks.onTransferComplete();

    } else {
      console.warn(`[Relayo] Unhandled message type: '${type}'`, payload);
    }
  }


  /**
   * Get built file Blob on receiver side
   */
  public getReceivedBlob(index: number): Blob | undefined {
    return this.receivedBlobs.get(index);
  }

  /**
   * Destroy peer and connections
   */
  public destroy() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch {
        // ignore
      }
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
  }
}
