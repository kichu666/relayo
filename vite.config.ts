import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

import { cloudflare } from "@cloudflare/vite-plugin";

// Relayo Zero-Memory HTTPS Direct Streaming Architecture (WebRTC P2P)
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl(), cloudflare()],
  server: {
    host: true, // Force Vite to bind to local network interfaces (0.0.0.0)
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('nanostores')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('peerjs')) {
              return 'webrtc-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('qrcode.react') || id.includes('html5-qrcode')) {
              return 'qr-tools';
            }
          }
        },
      },
    },
  },
});