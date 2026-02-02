'use strict';

const fs = require('fs');
const path = require('path');

// Load and parse replay lines from a file
function loadReplayLines(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// Start replaying frames from a file at regular intervals
function startReplay({ replayPath, root, emitFrame, intervalMs = 1000 }) {
  const lines = loadReplayLines(replayPath);
  let i = 0;

  console.log(`MODE=replay using ${path.relative(root, replayPath)}`);

  const timer = setInterval(() => {
    if (!lines.length) return;

    const line = lines[i];
    i = (i + 1) % lines.length;

    try {
      const frame = JSON.parse(line);
      emitFrame(frame, 'replay');
    } catch {}
  }, intervalMs);

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

module.exports = { startReplay };
