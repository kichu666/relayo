import { $sessionStore, $transferStore, triggerConnectionToast } from './sessionStore';
import { DEFAULT_ICE_SERVERS } from '../webrtcManager';

const CHUNK_SIZE = 64 * 1024; // 64KB optimal WebRTC DataChannel chunk size

export interface FileMetadataHeader {
  type: 'HEADER';
  name: string;
  size: number;
  mimeType: string;
}

export interface FileEofHeader {
  type: 'EOF';
  name: string;
}

export type WebRTCMessageHeader = FileMetadataHeader | FileEofHeader;

class WebRTCFileTransferEngine {
  private localPeerConnection: RTCPeerConnection | null = null;
  private remotePeerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  private activeRole: 'sending' | 'receiving' | 'idle' = 'idle';
  private incomingChunks: ArrayBuffer[] = [];
  private incomingMetadata: FileMetadataHeader | null = null;
  private incomingBytesRead = 0;
  private startTime = 0;

  public resetEngineRole(): void {
    this.activeRole = 'idle';
    this.incomingChunks = [];
    this.incomingMetadata = null;
    this.incomingBytesRead = 0;
    $transferStore.setKey('transferRole', 'idle');
    $transferStore.setKey('status', 'idle');
  }

  /**
   * Bind DataChannel state strictly to UI transitions (onopen & onclose)
   */
  public attachDataChannelListeners(dc: RTCDataChannel): void {
    this.dataChannel = dc;
    this.dataChannel.binaryType = 'arraybuffer';

    this.dataChannel.onopen = () => {
      $sessionStore.setKey('state', 'CONNECTED');
      triggerConnectionToast('Successfully connected to peer device.');
    };

    this.dataChannel.onclose = () => {
      if ($sessionStore.get().state === 'CONNECTED') {
        $sessionStore.setKey('state', 'IDLE');
      }
    };

    this.dataChannel.onmessage = (event) => this.handleReceiverMessage(event);

    // If channel is already open upon binding, force instant transition
    if (dc.readyState === 'open') {
      $sessionStore.setKey('state', 'CONNECTED');
      triggerConnectionToast('Successfully connected to peer device.');
    }
  }

  /**
   * Create WebRTC loopback channels for local testing & file streaming
   */
  public async initializeLocalLoopback(): Promise<RTCDataChannel> {
    this.localPeerConnection = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });
    this.remotePeerConnection = new RTCPeerConnection({ iceServers: DEFAULT_ICE_SERVERS });

    this.dataChannel = this.localPeerConnection.createDataChannel('fileTransfer', {
      ordered: true,
    });

    this.attachDataChannelListeners(this.dataChannel);

    this.remotePeerConnection.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.binaryType = 'arraybuffer';

      receiveChannel.onopen = () => {
        $sessionStore.setKey('state', 'CONNECTED');
        triggerConnectionToast('Successfully connected to peer device.');
      };

      receiveChannel.onclose = () => {
        $sessionStore.setKey('state', 'IDLE');
      };

      receiveChannel.onmessage = (e) => this.handleReceiverMessage(e);
    };

    this.localPeerConnection.onicecandidate = (e) => {
      if (e.candidate && this.remotePeerConnection) {
        this.remotePeerConnection.addIceCandidate(e.candidate);
      }
    };
    this.remotePeerConnection.onicecandidate = (e) => {
      if (e.candidate && this.localPeerConnection) {
        this.localPeerConnection.addIceCandidate(e.candidate);
      }
    };

    const offer = await this.localPeerConnection.createOffer();
    await this.localPeerConnection.setLocalDescription(offer);
    await this.remotePeerConnection.setRemoteDescription(offer);

    const answer = await this.remotePeerConnection.createAnswer();
    await this.remotePeerConnection.setRemoteDescription(answer);
    await this.localPeerConnection.setRemoteDescription(answer);

    $sessionStore.setKey('state', 'CONNECTED');
    return this.dataChannel;
  }

  /**
   * Sender Logic: Stream chunks over DataChannel (Role locked to 'sending')
   */
  public async sendFiles(files: File[]): Promise<void> {
    if (files.length === 0) return;

    this.activeRole = 'sending';
    $transferStore.setKey('transferRole', 'sending');
    $transferStore.setKey('role', 'sender');

    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      await this.initializeLocalLoopback();
      await new Promise<void>((resolve) => {
        if (this.dataChannel?.readyState === 'open') return resolve();
        this.dataChannel!.onopen = () => {
          $sessionStore.setKey('state', 'CONNECTED');
          triggerConnectionToast('Successfully connected to peer device.');
          resolve();
        };
      });
    }

    for (const file of files) {
      await this.streamSingleFileAsSender(file);
    }
  }

  private async streamSingleFileAsSender(file: File): Promise<void> {
    $transferStore.set({
      role: 'sender',
      transferRole: 'sending',
      status: 'sending',
      fileName: file.name,
      fileSize: file.size,
      bytesTransferred: 0,
      progressPercent: 0,
      transferSpeedMbps: 0,
      downloadUrl: null,
    });

    this.startTime = Date.now();

    const header: FileMetadataHeader = {
      type: 'HEADER',
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
    };
    this.dataChannel!.send(JSON.stringify(header));

    let offset = 0;
    const HIGH_WATERMARK = 1024 * 1024;
    const LOW_WATERMARK = 256 * 1024;

    if (this.dataChannel) {
      this.dataChannel.bufferedAmountLowThreshold = LOW_WATERMARK;
    }

    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();

      if (this.dataChannel && this.dataChannel.bufferedAmount > HIGH_WATERMARK) {
        await new Promise<void>((resolve) => {
          let resolved = false;
          const onLow = () => {
            if (!resolved) {
              resolved = true;
              this.dataChannel?.removeEventListener('bufferedamountlow', onLow);
              resolve();
            }
          };
          this.dataChannel?.addEventListener('bufferedamountlow', onLow);
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              this.dataChannel?.removeEventListener('bufferedamountlow', onLow);
              resolve();
            }
          }, 30);
        });
      }

      this.dataChannel!.send(buffer);
      offset += buffer.byteLength;

      const durationSec = (Date.now() - this.startTime) / 1000 || 0.001;
      const speedMb = offset / (1024 * 1024 * durationSec);
      const percent = Math.min(100, Math.round((offset / file.size) * 100));

      $transferStore.setKey('bytesTransferred', offset);
      $transferStore.setKey('progressPercent', percent);
      $transferStore.setKey('transferSpeedMbps', parseFloat(speedMb.toFixed(2)));
    }

    const eof: FileEofHeader = {
      type: 'EOF',
      name: file.name,
    };
    this.dataChannel!.send(JSON.stringify(eof));

    $transferStore.setKey('status', 'sent_completed');
    $transferStore.setKey('progressPercent', 100);
  }

  /**
   * Receiver Logic: Reassemble chunks into Blob and trigger auto-download
   */
  private handleReceiverMessage(event: MessageEvent): void {
    if (this.activeRole === 'sending') {
      return;
    }

    $sessionStore.setKey('state', 'CONNECTED');

    const data = event.data;

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data) as WebRTCMessageHeader;

        if (parsed.type === 'HEADER') {
          this.activeRole = 'receiving';
          this.incomingMetadata = parsed;
          this.incomingChunks = [];
          this.incomingBytesRead = 0;
          this.startTime = Date.now();

          $transferStore.set({
            role: 'receiver',
            transferRole: 'receiving',
            status: 'receiving',
            fileName: parsed.name,
            fileSize: parsed.size,
            bytesTransferred: 0,
            progressPercent: 0,
            transferSpeedMbps: 0,
            downloadUrl: null,
          });
        } else if (parsed.type === 'EOF' && this.incomingMetadata) {
          const blob = new Blob(this.incomingChunks, {
            type: this.incomingMetadata.mimeType,
          });
          const downloadUrl = URL.createObjectURL(blob);

          $transferStore.setKey('role', 'receiver');
          $transferStore.setKey('transferRole', 'receiving');
          $transferStore.setKey('status', 'received_completed');
          $transferStore.setKey('progressPercent', 100);
          $transferStore.setKey('downloadUrl', downloadUrl);

          this.triggerAutoDownload(downloadUrl, this.incomingMetadata.name);
        }
      } catch (err) {
        console.error('Failed to parse WebRTC header:', err);
      }
    } else if ((data instanceof ArrayBuffer || ArrayBuffer.isView(data) || data instanceof Blob) && this.incomingMetadata) {
      if (data instanceof Blob) {
        data.arrayBuffer().then((buf) => this.processIncomingChunk(buf));
      } else {
        const buf = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        this.processIncomingChunk(buf);
      }
    }
  }

  private processIncomingChunk(buf: ArrayBuffer): void {
    if (!this.incomingMetadata) return;
    this.incomingChunks.push(buf);
    this.incomingBytesRead += buf.byteLength;

    const durationSec = (Date.now() - this.startTime) / 1000 || 0.001;
    const speedMb = this.incomingBytesRead / (1024 * 1024 * durationSec);
    const percent = Math.min(
      100,
      Math.round((this.incomingBytesRead / this.incomingMetadata.size) * 100)
    );

    $transferStore.setKey('role', 'receiver');
    $transferStore.setKey('transferRole', 'receiving');
    $transferStore.setKey('status', 'receiving');
    $transferStore.setKey('bytesTransferred', this.incomingBytesRead);
    $transferStore.setKey('progressPercent', percent);
    $transferStore.setKey('transferSpeedMbps', parseFloat(speedMb.toFixed(2)));
  }

  public triggerAutoDownload(url: string, fileName: string): void {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

export const webrtcTransferEngine = new WebRTCFileTransferEngine();
