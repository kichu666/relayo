import { Html5Qrcode } from 'html5-qrcode';

export type ScanCallback = (decodedText: string) => void;
export type ErrorCallback = (errorMessage: string) => void;

export class BarcodeScannerEngine {
  private html5QrCode: Html5Qrcode | null = null;
  private isScanning = false;

  /**
   * Check if native WebCodecs BarcodeDetector API is supported
   */
  public static supportsNativeBarcodeDetector(): boolean {
    return 'BarcodeDetector' in window;
  }

  /**
   * Start video stream and scan QR codes in real-time
   */
  public async startScan(
    elementId: string,
    onSuccess: ScanCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    if (this.isScanning) return;

    try {
      this.html5QrCode = new Html5Qrcode(elementId);
      this.isScanning = true;

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if ('vibrate' in navigator) {
            try {
              navigator.vibrate(50);
            } catch (e) {
              // ignore vibration error
            }
          }
          onSuccess(decodedText);
        },
        (errorMessage) => {
          if (onError) onError(errorMessage);
        }
      );
    } catch (err: any) {
      this.isScanning = false;
      console.error('Failed to start camera scanner:', err);
      if (onError) onError(err.message || 'Camera permission denied or camera unaccessible');
    }
  }

  /**
   * Stop scanner stream and release camera lock
   */
  public async stopScan(): Promise<void> {
    if (!this.isScanning || !this.html5QrCode) return;

    try {
      await this.html5QrCode.stop();
      this.html5QrCode.clear();
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    } finally {
      this.isScanning = false;
      this.html5QrCode = null;
    }
  }

  /**
   * Toggle camera flash / torch if supported
   */
  public async toggleTorch(on: boolean): Promise<boolean> {
    if (!this.html5QrCode) return false;
    try {
      // @ts-ignore
      await this.html5QrCode.applyVideoConstraints({
        advanced: [{ torch: on } as any]
      });
      return true;
    } catch (e) {
      console.warn('Torch function not supported on this device/browser');
      return false;
    }
  }
}
