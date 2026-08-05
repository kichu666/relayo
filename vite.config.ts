import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Relayo Zero-Memory HTTPS Direct Streaming Architecture (WebRTC P2P)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
  ],
  server: {
    host: true, // Force Vite to bind to local network interfaces (0.0.0.0)
    port: 5174,
  },
});
