import { map } from 'nanostores';

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB Chunk Slices (Prevents browser RAM spikes and Aw Snap crashes)

export interface LocalMetadataFile {
  index: number;
  name: string;
  size: number;
  mimeType: string;
  rawFile?: File;
}

export interface ShareSessionState {
  viewMode: 'home' | 'sender_host' | 'receiver_download';
  shareId: string | null;
  shareUrl: string | null;
  files: LocalMetadataFile[];
  isUploading: boolean;
  uploadProgressPercent: number;
  currentUploadingFileName: string;
  isLoadingInfo: boolean;
  toastMessage: string | null;
}

export const $shareStore = map<ShareSessionState>({
  viewMode: 'home',
  shareId: null,
  shareUrl: null,
  files: [],
  isUploading: false,
  uploadProgressPercent: 0,
  currentUploadingFileName: '',
  isLoadingInfo: false,
  toastMessage: null,
});

export function triggerToast(message: string) {
  $shareStore.setKey('toastMessage', message);
  setTimeout(() => {
    $shareStore.setKey('toastMessage', null);
  }, 4000);
}

/**
 * Host files on sender device using Zero-Memory Chunked File Slicing (File.slice)
 */
export async function hostFilesOnSender(files: File[]): Promise<string> {
  if (files.length === 0) throw new Error('No files selected');

  $shareStore.setKey('isUploading', true);
  $shareStore.setKey('uploadProgressPercent', 0);

  const shareId = 'relayo-' + Math.random().toString(36).substring(2, 8);
  const host = window.location.host;
  const protocol = window.location.protocol;
  const shareUrl = `${protocol}//${host}/#share?id=${shareId}`;

  const metadataList: LocalMetadataFile[] = files.map((file, i) => ({
    index: i,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    rawFile: file,
  }));

  // 1. Initialize session on disk-backed server
  const initRes = await fetch('/api/share/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shareId,
      files: metadataList.map((f) => ({
        index: f.index,
        name: f.name,
        size: f.size,
        mimeType: f.mimeType,
      })),
    }),
  });

  if (!initRes.ok) {
    $shareStore.setKey('isUploading', false);
    throw new Error('Failed to initialize share session on local server');
  }

  // 2. Stream File Chunks Sequentially using File.slice(start, end)
  let totalBytesAllFiles = files.reduce((acc, f) => acc + f.size, 0) || 1;
  let totalBytesUploaded = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    $shareStore.setKey('currentUploadingFileName', file.name);

    let offset = 0;
    while (offset < file.size) {
      const chunkSlice = file.slice(offset, offset + CHUNK_SIZE);

      const chunkRes = await fetch(
        `/api/share/chunk?id=${encodeURIComponent(shareId)}&index=${i}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: chunkSlice, // Direct Binary Chunk Stream (Zero Base64 String Overhead!)
        }
      );

      if (!chunkRes.ok) {
        $shareStore.setKey('isUploading', false);
        throw new Error(`Failed to upload chunk for file ${file.name}`);
      }

      offset += chunkSlice.size;
      totalBytesUploaded += chunkSlice.size;

      const progress = Math.min(
        100,
        Math.round((totalBytesUploaded / totalBytesAllFiles) * 100)
      );
      $shareStore.setKey('uploadProgressPercent', progress);
    }
  }

  $shareStore.set({
    viewMode: 'sender_host',
    shareId,
    shareUrl,
    files: metadataList,
    isUploading: false,
    uploadProgressPercent: 100,
    currentUploadingFileName: '',
    isLoadingInfo: false,
    toastMessage: 'Relayo Local Web Share active! Ready for high-speed downloads.',
  });

  return shareUrl;
}

/**
 * Fetch shared file list metadata on receiver device
 */
export async function loadReceiverShareInfo(shareId: string): Promise<void> {
  $shareStore.setKey('isLoadingInfo', true);

  try {
    const res = await fetch(`/api/share/info?id=${encodeURIComponent(shareId)}`);
    if (!res.ok) {
      throw new Error('Share link expired or not found.');
    }

    const data = await res.json();
    const host = window.location.host;
    const protocol = window.location.protocol;
    const shareUrl = `${protocol}//${host}/#share?id=${shareId}`;

    const files: LocalMetadataFile[] = data.files.map((f: any) => ({
      index: f.index,
      name: f.name,
      size: f.size,
      mimeType: f.mimeType,
    }));

    $shareStore.set({
      viewMode: 'receiver_download',
      shareId,
      shareUrl,
      files,
      isUploading: false,
      uploadProgressPercent: 100,
      currentUploadingFileName: '',
      isLoadingInfo: false,
      toastMessage: 'Loaded shared files list.',
    });
  } catch (err: any) {
    $shareStore.setKey('isLoadingInfo', false);
    triggerToast(err.message || 'Failed to load share info');
  }
}
