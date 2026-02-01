'use strict';

/**
 * Convert value to string, treating null/undefined as empty string.
 * @returns {string}
 */
function asString(v) {
  return v == null ? '' : String(v);
}

/**
 * Start live serial data reading.
 *
 * @param {Object} options
 * @param {Function} options.resolveSerialPort - Function to auto-detect serial port.
 * @param {Function} options.emitFrame - Function to emit parsed data frames.
 * @param {number} [options.baudRate=115200] - Baud rate for serial communication.
 * @param {string} [options.portPathEnv=''] - Environment variable for serial port path.
 */
async function startLiveSerial({
  resolveSerialPort,
  emitFrame,
  baudRate = 115200,
  portPathEnv = '',
}) {
  const { SerialPort } = require('serialport');
  const { ReadlineParser } = require('@serialport/parser-readline');

  let portPath = asString(portPathEnv).trim();

  if (!portPath) {
    portPath = await resolveSerialPort();
  }

  if (!portPath) {
    console.error(
      'No SERIAL_PORT set and auto-detect found nothing plausible.',
    );
    console.error('Run: npm run ports');
    console.error('Then: SERIAL_PORT=<path> MODE=live npm run dash:live');
  }

  console.log(`MODE=live serial ${portPath} @ ${Number(baudRate)}`);

  const serialPort = new SerialPort({
    path: portPath,
    baudRate: Number(baudRate),
  });
  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.on('open', () => console.log('Serial open.'));
  serialPort.on('error', (e) => console.error('Serial error:', e.message));

  parser.on('data', (line) => {
    const trimmed = String(line).trim();
    if (!trimmed) return;

    try {
      const frame = JSON.parse(trimmed);
      emitFrame(frame, 'live');
    } catch {
      // ignore
    }
  });
}

module.exports = { startLiveSerial };
