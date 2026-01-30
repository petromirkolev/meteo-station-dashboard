const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { resolveSerialPort } = require('./resolve-port');

const PORT = process.env.PORT || 5173;
const MODE = (process.env.MODE || 'replay').toLowerCase(); // 'replay' | 'live'

const ROOT = path.join(__dirname, '..');
const WEB_ROOT = path.join(ROOT, 'dashboard');

// Static file server helpers
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

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({ type: 'hello', ts: Date.now(), source: currentMode }),
  );
});

let currentMode = MODE;
let replayTimer = null;
let serialPort = null;
let parser = null;

function startReplay({ intervalMs = 1000 } = {}) {
  const replayPath = path.join(ROOT, 'replay', 'sample.ndjson');

  const raw = fs.readFileSync(replayPath, 'utf-8');
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    console.warn('Replay dataset is empty:', replayPath);
    return;
  }

  let i = 0;

  replayTimer = setInterval(() => {
    const line = lines[i];
    i = (i + 1) % lines.length;

    try {
      const frame = JSON.parse(line);
      broadcast({ type: 'frame', ts: Date.now(), source: 'replay', frame });
    } catch {}
  }, intervalMs);

  console.log(`Replay streaming ON (interval: ${intervalMs}ms)`);
}

function stopReplay() {
  if (replayTimer) clearInterval(replayTimer);
  replayTimer = null;
  console.log('Replay streaming OFF');
}

async function startLiveSerial() {
  let serialPort = null;

  const { SerialPort } = require('serialport');
  const { ReadlineParser } = require('@serialport/parser-readline');

  let portPath = process.env.SERIAL_PORT;
  const baudRate = Number(process.env.BAUD || 115200);

  if (!portPath) {
    portPath = await resolveSerialPort();
  }

  if (!portPath) {
    console.error(
      'No SERIAL_PORT set and auto-detect found nothing plausible.',
    );
    console.error('Run: npm run ports');
    console.error('Then: SERIAL_PORT=<path> MODE=live npm run dash:live');
    return;
  }

  serialPort = new SerialPort({ path: portPath, baudRate });
  parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.on('open', () =>
    console.log(`Serial open: ${portPath} @ ${baudRate}`),
  );
  serialPort.on('error', (e) => console.error('Serial error:', e.message));

  parser.on('data', (line) => {
    const trimmed = String(line).trim();
    if (!trimmed) return;

    try {
      const frame = JSON.parse(trimmed);
      broadcast({ type: 'frame', ts: Date.now(), source: 'live', frame });
    } catch {}
  });

  console.log('Live serial streaming ON');
}

function stopLiveSerial() {
  if (parser) {
    try {
      parser.removeAllListeners('data');
    } catch {}
    parser = null;
  }

  if (serialPort) {
    try {
      serialPort.close();
    } catch {}
    serialPort = null;
  }

  console.log('Live serial streaming OFF');
}

async function startMode(mode) {
  currentMode = mode;

  if (mode === 'live') await startLiveSerial();
  else startReplay({ intervalMs: 1000 });
}

function stopMode(mode) {
  if (mode === 'live') stopLiveSerial();
  else stopReplay();
}

function switchMode(nextMode) {
  if (nextMode === currentMode) return;

  stopMode(currentMode);
  startMode(nextMode);
  broadcast({ type: 'mode', ts: Date.now(), source: currentMode });
}

// Boot
server.listen(PORT, () => {
  console.log(`Dev server running: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`MODE=${MODE}`);

  startMode(MODE);
});
