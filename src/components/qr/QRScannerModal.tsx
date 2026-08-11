import React, { useEffect, useRef, useState } from 'react';
import { BarcodeScannerEngine } from '../../logic/qr/barcodeScanner';
import { QRScanFrame } from './QRScanFrame';
import { ManualCodeInput } from './ManualCodeInput';
import { X, Camera, Key, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
  onManualPinSubmit: (pin: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onManualPinSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scannerRef = useRef<BarcodeScannerEngine | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!scannerRef.current) {
      scannerRef.current = new BarcodeScannerEngine();
    }

    if (activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const startCameraScanner = async () => {
    setErrorMessage(null);
    setIsScanning(true);
    setTimeout(async () => {
      if (scannerRef.current) {
        await scannerRef.current.startScan(
          'qr-reader-container',
          (text) => {
            stopCameraScanner();
            onScanSuccess(text);
          },
          (err) => {
            if (!err.includes('No MultiFormat Readers') && !err.includes('NotFoundException')) {
              setErrorMessage(err);
            }
          }
        );
      }
    }, 300);
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stopScan();
    }
    setIsScanning(false);
    setTorchActive(false);
  };

  const toggleTorch = async () => {
    if (scannerRef.current) {
      const success = await scannerRef.current.toggleTorch(!torchActive);
      if (success) {
        setTorchActive(!torchActive);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={() => {
            stopCameraScanner();
            onClose();
          }}
          aria-label="Close QR Code scanner modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all z-40 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-white tracking-wide">Scan Relayo QR Code</h2>
          <p className="text-xs text-slate-400 mt-0.5">Align the QR code within the viewfinder frame</p>
        </div>

        {/* Camera / Manual PIN Tab Switcher */}
        <div className="w-full flex p-1 rounded-xl bg-white/5 border border-white/10 mb-5 z-30" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'camera'}
            onClick={() => setActiveTab('camera')}
            aria-label="Camera Viewfinder"
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Viewfinder</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'manual'}
            onClick={() => setActiveTab('manual')}
            aria-label="Manual PIN Input"
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manual PIN</span>
          </button>
        </div>

        {/* Camera Viewfinder Box */}
        {activeTab === 'camera' ? (
          <div className="w-full flex flex-col items-center">
            {/* Requirement 1 & 2: Perfect Square Container + Absolute Inset-0 Video */}
            <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-black shadow-inner border border-white/10 mb-6">
              <div id="qr-reader-container" className="absolute inset-0 w-full h-full object-cover" />
              <QRScanFrame
                isScanning={isScanning}
                torchActive={torchActive}
                onToggleTorch={toggleTorch}
              />
            </div>

            {errorMessage && (
              <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 max-w-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              Scanning transfers session tokens safely via browser WebCrypto end-to-end encryption.
            </p>
          </div>
        ) : (
          <div className="w-full py-4">
            <ManualCodeInput onSubmit={onManualPinSubmit} />
          </div>
        )}
      </div>
    </div>
  );
};
