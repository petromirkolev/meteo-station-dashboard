'use strict';

const { WebSocketServer } = require('ws');
const { resolveSerialPort } = require('./get-port');

const { getConfig } = require('./lib/sources');
const { createStaticServer } = require('./lib/static');
const { createRecorder } = require('./lib/recording');
const { startReplay } = require('./lib/replay');
const { startLiveSerial } = require('./lib/live-serial');
const { startMode } = require('./lib/mode');

// Replay control (start only after first WS client connects)
let replayCtrl = null;
let replayStarted = false;
let clientCount = 0;

const cfg = getConfig();

// HTTP static server
const server = createStaticServer({ webRoot: cfg.WEB_ROOT });

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

// Broadcast to all connected clients
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// Recorder
const recorder = createRecorder({
  recordDir: cfg.RECORD_DIR,
  root: cfg.ROOT,
  mode: cfg.MODE,
  onStateChange: () => {
    broadcastState();
  },
});

// Broadcast current recorder state to all clients
function broadcastState() {
  const { recording, recordFile } = recorder.getState();
  broadcast({
    type: 'state',
    mode: cfg.MODE,
    recording,
    recordFile,
  });
}

// Emit a new frame from source
function emitFrame(frame, source) {
  broadcast({ type: 'frame', ts: Date.now(), source, frame });
  recorder.maybeWriteFrame(frame);
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', ts: Date.now(), source: cfg.MODE }));

  const { recording, recordFile } = recorder.getState();
  ws.send(
    JSON.stringify({ type: 'state', mode: cfg.MODE, recording, recordFile }),
  );

  clientCount++;

  // Start replay only after the first client connects (for Playwright compatibility)
  if (cfg.MODE === 'replay' && !replayStarted) {
    replayStarted = true;
    replayCtrl = startReplay({
      replayPath: cfg.REPLAY_PATH,
      root: cfg.ROOT,
      emitFrame,
      intervalMs: Number(process.env.REPLAY_INTERVAL_MS || 1000),
    });
  }

  ws.on('message', (data) => {
    const text = Buffer.isBuffer(data) ? data.toString() : String(data);

    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }

    if (msg?.type === 'control' && msg?.action === 'record') {
      recorder.toggle();
    }
  });

  ws.on('close', () => {
    clientCount--;

    if (cfg.MODE === 'replay' && clientCount <= 0) {
      replayCtrl?.stop?.();
      replayCtrl = null;
      clientCount = 0;
    }
  });
});

// Start mode
startMode({
  mode: cfg.MODE,
  // Replay starts on first WS connection (see wss.on('connection'))
  startReplay: () => null,
  // Live can start immediately
  startLive: () =>
    startLiveSerial({
      resolveSerialPort,
      emitFrame,
      baudRate: cfg.BAUD,
      portPathEnv: cfg.SERIAL_PORT,
    }),
});

server.listen(cfg.PORT, () => {
  console.log(`Dev server running: http://localhost:${cfg.PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${cfg.PORT}/ws`);
});
