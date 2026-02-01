const fs = require('fs');
const path = require('path');

/** Generate a timestamp string for filenames.
 * Format: YYYY-MM-DD_HH-MM-SS
 */
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

/** Create a recorder object to manage recording data frames to a file.
 * @param {Object} options
 * @param {string} options.recordDir - Directory to save recordings.
 * @param {string} options.root - Root path for relative file paths.
 * @param {string} options.mode - Mode identifier for the recording file.
 * @param {function} [options.onStateChange] - Callback for state changes.
 * @returns {Object} Recorder with methods to control recording.
 */
function createRecorder({ recordDir, root, mode, onStateChange }) {
  let recording = false;
  let recordStream = null;
  let recordFile = null;

  /** Get the current state of the recorder.
   * @returns {Object} Current state with recording status and file name.
   */
  function getState() {
    return { recording, recordFile };
  }
  /** Notify state change via callback if provided. */
  function notify() {
    if (typeof onStateChange === 'function') onStateChange(getState());
  }
  /** Start recording data frames to a file. */
  function start() {
    if (recording) return;

    fs.mkdirSync(recordDir, { recursive: true });
    recordFile = `record_${nowStamp()}_${mode}.ndjson`;
    const fullPath = path.join(recordDir, recordFile);

    recordStream = fs.createWriteStream(fullPath, { flags: 'a' });
    recording = true;

    console.log(`RECORDING: ON -> ${path.relative(root, fullPath)}`);
    notify();
  }
  /** Stop recording data frames. */
  function stop() {
    if (!recording) return;

    recording = false;
    if (recordStream) {
      recordStream.end();
      recordStream = null;
    }

    console.log('RECORDING: OFF');
    notify();
  }
  /** Toggle recording state. */
  function toggle() {
    if (!recording) start();
    else stop();
  }
  /** Write a data frame to the recording file if recording is active.
   * @param {Object} frame - Data frame to record.
   */
  function maybeWriteFrame(frame) {
    if (!recording || !recordStream) return;
    try {
      recordStream.write(JSON.stringify(frame) + '\n');
    } catch (e) {
      console.error('Record write failed:', e?.message || e);
      stop();
    }
  }

  return {
    getState,
    start,
    stop,
    toggle,
    maybeWriteFrame,
  };
}

module.exports = { createRecorder };
