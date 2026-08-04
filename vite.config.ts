import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Disk-Backed Zero-Memory Local Web Share Store
const TEMP_SHARE_DIR = path.join(os.tmpdir(), 'relayo_local_share_store');

if (!fs.existsSync(TEMP_SHARE_DIR)) {
  fs.mkdirSync(TEMP_SHARE_DIR, { recursive: true });
}

interface StoredFileMetadata {
  index: number;
  name: string;
  size: number;
  mimeType: string;
  diskPath: string;
}

interface ShareSession {
  id: string;
  createdAt: number;
  files: StoredFileMetadata[];
}

const shareSessions: Record<string, ShareSession> = {};

// Clean up stale share sessions older than 1 hour
setInterval(() => {
  const now = Date.now();
  for (const id in shareSessions) {
    if (now - shareSessions[id].createdAt > 60 * 60 * 1000) {
      const sessionDir = path.join(TEMP_SHARE_DIR, id);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }
      delete shareSessions[id];
    }
  }
}, 5 * 60 * 1000);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    {
      name: 'relayo-zero-memory-file-share-server',
      configureServer(server) {
        server.middlewares.use('/api/share', (req, res) => {
          // Enable CORS for local subnet network routes
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Range, Range');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          const url = new URL(req.url || '', `http://${req.headers.host}`);

          // POST /api/share/init - Create Share Session
          if (req.method === 'POST' && url.pathname === '/init') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                const { shareId, files } = JSON.parse(body); // files: [{ index, name, size, mimeType }]
                if (!shareId || !Array.isArray(files)) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid share initialization payload' }));
                  return;
                }

                const sessionDir = path.join(TEMP_SHARE_DIR, shareId);
                if (!fs.existsSync(sessionDir)) {
                  fs.mkdirSync(sessionDir, { recursive: true });
                }

                shareSessions[shareId] = {
                  id: shareId,
                  createdAt: Date.now(),
                  files: files.map((f: any) => ({
                    index: f.index,
                    name: f.name,
                    size: f.size,
                    mimeType: f.mimeType || 'application/octet-stream',
                    diskPath: path.join(sessionDir, `file_${f.index}.bin`),
                  })),
                };

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, shareId }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Failed to parse initialization JSON' }));
              }
            });
            return;
          }

          // POST /api/share/chunk - Write 2MB-5MB Chunk Stream directly to disk using fs.createWriteStream
          if (req.method === 'POST' && url.pathname === '/chunk') {
            const shareId = url.searchParams.get('id');
            const fileIndexStr = url.searchParams.get('index') || '0';
            const fileIndex = parseInt(fileIndexStr, 10);

            if (!shareId || !shareSessions[shareId]) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Share session not found' }));
              return;
            }

            const targetFile = shareSessions[shareId].files.find((f) => f.index === fileIndex);
            if (!targetFile) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'File index not found' }));
              return;
            }

            const writeStream = fs.createWriteStream(targetFile.diskPath, { flags: 'a' });
            req.pipe(writeStream);

            writeStream.on('finish', () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            });

            writeStream.on('error', (err) => {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            });
            return;
          }

          // GET /api/share/info?id=SHARE_ID - Get file list metadata for receiver
          if (req.method === 'GET' && url.pathname === '/info') {
            const shareId = url.searchParams.get('id');
            if (!shareId || !shareSessions[shareId]) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Share session expired or not found' }));
              return;
            }

            const session = shareSessions[shareId];
            const fileList = session.files.map((f) => ({
              index: f.index,
              name: f.name,
              size: f.size,
              mimeType: f.mimeType,
            }));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ shareId: session.id, files: fileList }));
            return;
          }

          // GET /api/share/download?id=SHARE_ID&index=INDEX - HTTP 206 Range Stream File directly off disk
          if (req.method === 'GET' && url.pathname === '/download') {
            const shareId = url.searchParams.get('id');
            const fileIndexStr = url.searchParams.get('index') || '0';
            const fileIndex = parseInt(fileIndexStr, 10);

            if (!shareId || !shareSessions[shareId]) {
              res.statusCode = 404;
              res.end('Share session expired or not found');
              return;
            }

            const session = shareSessions[shareId];
            const targetFile = session.files.find((f) => f.index === fileIndex);

            if (!targetFile || !fs.existsSync(targetFile.diskPath)) {
              res.statusCode = 404;
              res.end('File not found on host storage');
              return;
            }

            const stat = fs.statSync(targetFile.diskPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            res.setHeader(
              'Content-Disposition',
              `attachment; filename="${encodeURIComponent(targetFile.name)}"`
            );

            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunksize = end - start + 1;

              const fileStream = fs.createReadStream(targetFile.diskPath, { start, end });
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': targetFile.mimeType,
              });
              fileStream.pipe(res);
            } else {
              res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': targetFile.mimeType,
              });
              fs.createReadStream(targetFile.diskPath).pipe(res);
            }
            return;
          }

          res.statusCode = 404;
          res.end();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0', // Direct Local Subnet Network Binding across 10.x / 192.168.x routes
  },
});
