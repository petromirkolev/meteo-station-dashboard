const path = require('path');

/**
 * Retrieves configuration settings from environment variables
 * and sets default values where necessary.
 *
 * @returns {Object} Configuration object containing:
 *  - PORT: Port number for the server
 *  - MODE: Operation mode ('replay' or 'live')
 *  - ROOT: Root directory of the project
 *  - WEB_ROOT: Directory for the web dashboard
 *  - REPLAY_PATH: Path to the replay data file
 *  - RECORD_DIR: Directory for storing recordings
 *  - BAUD: Baud rate for serial communication
 *  - SERIAL_PORT: Serial port identifier
 */
function getConfig() {
  const PORT = Number(process.env.PORT || 5173);
  const MODE = String(process.env.MODE || 'replay').toLowerCase(); // 'replay' | 'live'

  const ROOT = path.join(__dirname, '..', '..'); // Project root directory
  const WEB_ROOT = path.join(ROOT, 'dashboard');
  const REPLAY_PATH = path.join(ROOT, 'replay', 'sample.ndjson');
  const RECORD_DIR = path.join(ROOT, 'replay', 'recordings');

  const BAUD = Number(process.env.BAUD || 115200);
  const SERIAL_PORT = process.env.SERIAL_PORT
    ? String(process.env.SERIAL_PORT)
    : '';

  return {
    PORT,
    MODE,
    ROOT,
    WEB_ROOT,
    REPLAY_PATH,
    RECORD_DIR,
    BAUD,
    SERIAL_PORT,
  };
}

module.exports = { getConfig };
