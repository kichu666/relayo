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
  onProgress: (percent: number, currentFile: string) => void;
  onFileReceived: (index: number, blob: Blob) => void;
  onTransferComplete: () => void;
  onError: (error: string) => void;
}

const CHUNK_SIZE = 16 * 1024; // 16KB binary chunks

export class WebRTCManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private role: 'sender' | 'receiver' | null = null;
  private roomId: string | null = null;
  private callbacks: WebRTCManagerCallbacks;

  private filesToHost: File[] = [];
  private fileMetadataList: FileMetadata[] = [];

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
    const fullMsg = `[${category}] ${errMessage}`;
    console.error(`[Relayo PeerJS ERROR] ${fullMsg}`);
    this.callbacks.onError(fullMsg);
    this.callbacks.onStateChange('error', fullMsg);
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

    this.callbacks.onStateChange('waiting_for_peer', 'Ready for peer connection (Sender Active)');

    // 2. Guard against null/empty share ID before instantiating Peer
    if (!shareId || shareId === 'null' || shareId.trim() === '') {
      this.reportError('Invalid Room ID', 'Share ID is null or invalid. Please generate a new share link.');
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
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
              urls: 'turn:global.relay.metered.ca:80',
              username: '8ca289ae098e106bad8fdba9',
              credential: 'bvaLXeyfody7sk6m',
            },
            {
              urls: 'turn:global.relay.metered.ca:443',
              username: '8ca289ae098e106bad8fdba9',
              credential: 'bvaLXeyfody7sk6m',
            },
          ],
        },
      });

      this.peer = peer;

      peer.on('open', (id) => {
        console.log(`[Relayo PeerJS SENDER] Host peer opened on 0.peerjs.com with ID: ${id}`);
        this.callbacks.onStateChange('waiting_for_peer', 'Ready for peer connection (Sender Active)');
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
    this.callbacks.onStateChange('connecting_peer', `Connecting to sender room '${targetRoomId}'...`);

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
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
              urls: 'turn:global.relay.metered.ca:80',
              username: '8ca289ae098e106bad8fdba9',
              credential: 'bvaLXeyfody7sk6m',
            },
            {
              urls: 'turn:global.relay.metered.ca:443',
              username: '8ca289ae098e106bad8fdba9',
              credential: 'bvaLXeyfody7sk6m',
            },
          ],
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

        this.callbacks.onStateChange('connecting_peer', `Connecting to sender room '${targetRoomId}'...`);

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
    this.callbacks.onStateChange('connecting_peer', 'Handshaking with peer...');

    let hasTriggeredOpen = false;

    // 30-second timeout: only on receiver side — ICE/TURN negotiation can take up to 20–30s.
    // The sender side has no DataChannel until peer.on('connection') fires, so no timeout needed there.
    let openTimeoutId: ReturnType<typeof setTimeout> | null = null;
    if (this.role === 'receiver') {
      openTimeoutId = setTimeout(() => {
        if (!hasTriggeredOpen) {
          console.error('[Relayo] DataChannel open timeout (30s) — sender may be offline or NAT traversal failed.');
          this.reportError(
            'Connection Timeout',
            'Could not reach the sender after 30 seconds. They may be offline or the room has expired. Please ask the sender for a new share link.'
          );
        }
      }, 30000);
    }

    const handleOpen = () => {
      // Clear timeout immediately as the very first action
      if (openTimeoutId !== null) {
        clearTimeout(openTimeoutId);
        openTimeoutId = null;
      }
      if (hasTriggeredOpen) return;
      hasTriggeredOpen = true;

      console.log(`[Relayo] DataChannel OPEN with peer: ${conn.peer}. Role: ${this.role}`);
      this.callbacks.onStateChange('connected', 'P2P DataChannel Connected!');

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
      if (openTimeoutId !== null) clearTimeout(openTimeoutId);
      this.callbacks.onStateChange('disconnected', 'P2P Connection closed.');
    });

    conn.on('error', (err: any) => {
      console.error(`[Relayo] DataChannel error:`, err);
      if (openTimeoutId !== null) clearTimeout(openTimeoutId);
      this.reportError('DataConnection Error', err.message || String(err));
    });
  }

  /**
   * Sender: Stream file binary chunks over PeerJS DataConnection
   */
  private async streamFilesToPeer(conn: DataConnection) {
    console.log(`[Relayo PeerJS] Sender starting binary stream of ${this.filesToHost.length} files...`);
    this.callbacks.onStateChange('transferring', 'Streaming files browser-to-browser...');

    const totalAllFilesBytes = this.filesToHost.reduce((acc, f) => acc + f.size, 0) || 1;
    let totalBytesSent = 0;

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

      // 2. Stream binary 16KB ArrayBuffer chunks
      let offset = 0;
      while (offset < file.size) {
        const chunkSlice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await chunkSlice.arrayBuffer();

        conn.send(arrayBuffer);
        offset += chunkSlice.size;
        totalBytesSent += chunkSlice.size;

        const progress = Math.min(100, Math.round((totalBytesSent / totalAllFilesBytes) * 100));
        this.callbacks.onProgress(progress, file.name);
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
      const progress = this.totalBytesExpectedAllFiles > 0
        ? Math.min(100, Math.round((this.totalBytesReceivedAllFiles / this.totalBytesExpectedAllFiles) * 100))
        : 0;
      this.callbacks.onProgress(progress, fileName);
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
      this.callbacks.onStateChange('transferring', `Receiving ${payload.name}...`);

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
