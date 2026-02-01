const { WebSocketServer } = require('ws');
const { resolveSerialPort } = require('./get-port');

const { getConfig } = require('./lib/sources');
const { createStaticServer } = require('./lib/static');
const { createRecorder } = require('./lib/recording');
const { startReplay } = require('./lib/replay');
const { startLiveSerial } = require('./lib/live-serial');
const { startMode } = require('./lib/mode');

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
  // Broadcast to dashboard
  broadcast({ type: 'frame', ts: Date.now(), source, frame });

  // Record frames
  recorder.maybeWriteFrame(frame);
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', ts: Date.now(), source: cfg.MODE }));

  const { recording, recordFile } = recorder.getState();
  ws.send(
    JSON.stringify({ type: 'state', mode: cfg.MODE, recording, recordFile }),
  );

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
});

// Start mode
startMode({
  mode: cfg.MODE,
  startReplay: () =>
    startReplay({
      replayPath: cfg.REPLAY_PATH,
      root: cfg.ROOT,
      emitFrame,
      intervalMs: 1000,
    }),
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
