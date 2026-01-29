const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 5173;

const ROOT = path.join(__dirname, '..');

const WEB_ROOT = path.join(ROOT, 'dashboard');

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const safePath = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(WEB_ROOT, safePath);

  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  return serveFile(res, filePath, contentTypeFor(filePath));
});

const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', ts: Date.now(), source: 'replay' }));
});

const replayPath = path.join(ROOT, 'replay', 'sample.ndjson');

function loadReplayLines() {
  const raw = fs.readFileSync(replayPath, 'utf-8');
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

let lines = loadReplayLines();
let i = 0;

setInterval(() => {
  if (lines.length === 0) return;

  const line = lines[i];
  i = (i + 1) % lines.length;

  try {
    const frame = JSON.parse(line);
    broadcast({
      type: 'frame',
      ts: Date.now(),
      source: 'replay',
      frame,
    });
  } catch {
    // skip bad line
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`Dev server running: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
