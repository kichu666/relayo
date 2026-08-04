import React from 'react';
import { useStore } from '@nanostores/react';
import { $transferStore } from '../../logic/qr/sessionStore';
import { webrtcTransferEngine } from '../../logic/qr/webrtcTransfer';
import { FileUp, FileDown, CheckCircle2, Download, RefreshCw, Zap } from 'lucide-react';

interface TransferProgressCardProps {
  onReset: () => void;
}

export const TransferProgressCard: React.FC<TransferProgressCardProps> = ({ onReset }) => {
  const transfer = useStore($transferStore);

  if (transfer.status === 'idle') return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSender = transfer.role === 'sender';
  const isSending = transfer.status === 'sending';
  const isSentCompleted = transfer.status === 'sent_completed';
  const isReceivedCompleted = transfer.status === 'received_completed';

  return (
    <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-emerald-500/30 shadow-2xl text-center relative overflow-hidden my-4 animate-fade-in">
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Status Icon */}
      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all ${
          isSentCompleted || isReceivedCompleted
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
            : isSending
            ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-indigo-500/20 animate-pulse'
            : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-cyan-500/20 animate-pulse'
        }`}
      >
        {isSentCompleted ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        ) : isReceivedCompleted ? (
          <Download className="w-8 h-8 text-emerald-400" />
        ) : isSending ? (
          <FileUp className="w-8 h-8 animate-bounce" />
        ) : (
          <FileDown className="w-8 h-8 animate-bounce" />
        )}
      </div>

      {/* Status Heading */}
      <h2 className="text-xl font-bold text-white mb-1">
        {isSentCompleted
          ? 'File Sent Successfully!'
          : isReceivedCompleted
          ? 'File Received & Downloaded!'
          : isSending
          ? 'Streaming Chunks to Peer...'
          : 'Receiving Chunks from Peer...'}
      </h2>

      <p className="text-xs text-slate-400 mb-6 font-mono truncate px-4">
        {transfer.fileName || 'WebRTC DataChannel Payload'}
      </p>

      {/* Animated Progress Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center text-xs text-slate-300 mb-2 font-mono">
          <span>
            {formatBytes(transfer.bytesTransferred)} / {formatBytes(transfer.fileSize)}
          </span>
          <span className="font-bold text-emerald-400">{transfer.progressPercent}%</span>
        </div>

        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_#10b981]"
            style={{ width: `${transfer.progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            Speed: {transfer.transferSpeedMbps} MB/s
          </span>
          <span>
            {isSender ? 'Role: Sender (Uploading)' : 'Role: Receiver (Downloading)'}
          </span>
        </div>
      </div>

      {/* Sender Completion UI: Show "Send Another File" (NO auto-download!) */}
      {isSentCompleted && (
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Send Another File</span>
          </button>
        </div>
      )}

      {/* Receiver Completion UI: Show "Download File Again" & "Done" */}
      {isReceivedCompleted && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          {transfer.downloadUrl && (
            <button
              onClick={() =>
                webrtcTransferEngine.triggerAutoDownload(
                  transfer.downloadUrl!,
                  transfer.fileName || 'download'
                )
              }
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File Again</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer border border-white/10"
          >
            <span>Done</span>
          </button>
        </div>
      )}
    </div>
  );
};
