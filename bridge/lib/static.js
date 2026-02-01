const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static file server for serving files from a specified web root directory.
function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

// Prevent directory traversal attacks by ensuring the requested path is within the base directory.
function safeJoin(baseDir, requestedPath) {
  const safePath = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(baseDir, safePath);
  if (!full.startsWith(baseDir)) return null;
  return full;
}

// Serve the requested file with appropriate headers.
function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    res.end(data);
  });
}

// Create and return an HTTP server that serves static files from the specified web root.
function createStaticServer({ webRoot }) {
  return http.createServer((req, res) => {
    const urlPath = String(req.url || '/').split('?')[0];
    const requested = urlPath === '/' ? '/index.html' : urlPath;
    const filePath = safeJoin(webRoot, requested);

    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    serveFile(res, filePath);
  });
}

module.exports = { createStaticServer };
