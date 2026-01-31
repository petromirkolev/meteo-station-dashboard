const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { resolveSerialPort } = require('./get-port');

const PORT = Number(process.env.PORT || 5173);
const MODE = String(process.env.MODE || 'replay').toLowerCase(); // 'replay' | 'live'

const ROOT = path.join(__dirname, '..');
const WEB_ROOT = path.join(ROOT, 'dashboard');
const REPLAY_PATH = path.join(ROOT, 'replay', 'sample.ndjson');
const RECORD_DIR = path.join(ROOT, 'replay', 'recordings');

// Serve pages
function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function safeJoin(baseDir, requestedPath) {
  const safePath = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(baseDir, safePath);
  if (!full.startsWith(baseDir)) return null;
  return full;
}

// FS-friendly timestamp e.g. 2026-01-31_19-42-03
function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    '_' +
    pad(d.getHours()) +
    '-' +
    pad(d.getMinutes()) +
    '-' +
    pad(d.getSeconds())
  );
}

// HTTP static server
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

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = safeJoin(WEB_ROOT, requested);

  if (!filePath) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  return serveFile(res, filePath);
});

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// Recording state
let recording = false;
let recordStream = null;
let recordFile = null;

function broadcastState() {
  broadcast({
    type: 'state',
    mode: MODE,
    recording,
    recordFile,
  });
}

function startRecording() {
  if (recording) return;

  fs.mkdirSync(RECORD_DIR, { recursive: true });
  recordFile = `record_${nowStamp()}_${MODE}.ndjson`;
  const fullPath = path.join(RECORD_DIR, recordFile);

  recordStream = fs.createWriteStream(fullPath, { flags: 'a' });
  recording = true;

  console.log(`RECORDING: ON -> ${path.relative(ROOT, fullPath)}`);
  broadcastState();
}

function stopRecording() {
  if (!recording) return;
  recording = false;

  if (recordStream) {
    recordStream.end();
    recordStream = null;
  }

  console.log('RECORDING: OFF');
  broadcastState();
}

function emitFrame(frame, source) {
  // Broadcast to dashboard
  broadcast({ type: 'frame', ts: Date.now(), source, frame });

  // Record frames
  if (recording && recordStream) {
    try {
      recordStream.write(JSON.stringify(frame) + '\n');
    } catch (e) {
      console.error('Record write failed:', e?.message || e);
      stopRecording();
    }
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', ts: Date.now(), source: MODE }));
  ws.send(JSON.stringify({ type: 'state', mode: MODE, recording, recordFile }));

  ws.on('message', (data) => {
    const text = Buffer.isBuffer(data) ? data.toString() : String(data);

    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }

    if (msg?.type === 'control' && msg?.action === 'record') {
      if (!recording) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  });
});

// Replay mode
let replayTimer = null;

function loadReplayLines(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function startReplay() {
  const lines = loadReplayLines(REPLAY_PATH);
  let i = 0;

  console.log(`MODE=replay using ${path.relative(ROOT, REPLAY_PATH)}`);
  replayTimer = setInterval(() => {
    if (!lines.length) return;

    const line = lines[i];
    i = (i + 1) % lines.length;

    try {
      const frame = JSON.parse(line);
      emitFrame(frame, 'replay');
    } catch {}
  }, 1000);
}

let serialPort = null;

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

  console.log(`MODE=live serial ${portPath} @ ${baudRate}`);

  serialPort = new SerialPort({ path: portPath, baudRate });
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.on('open', () => console.log('Serial open.'));
  serialPort.on('error', (e) => console.error('Serial error:', e.message));

  parser.on('data', (line) => {
    const trimmed = String(line).trim();
    if (!trimmed) return;

    try {
      const frame = JSON.parse(trimmed);
      emitFrame(frame, 'live');
    } catch {}
  });
}

function stopLiveSerial() {
  if (!serialPort) return;
  try {
    serialPort.close();
  } catch {}
  serialPort = null;
}

function startMode() {
  if (MODE === 'live') startLiveSerial();
  else startReplay();
}

startMode();

server.listen(PORT, () => {
  console.log(`Dev server running: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});
