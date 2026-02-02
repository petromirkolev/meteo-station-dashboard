'use strict';

const { SerialPort } = require('serialport');

function scorePort(p) {
  const path = (p.path || '').toLowerCase();
  const manufacturer = (p.manufacturer || '').toLowerCase();

  let score = 0;

  if (
    manufacturer.includes('arduino') ||
    path.includes('usbmodem') ||
    path.includes('usbserial') ||
    path.includes('ttyacm')
  )
    score += 100;

  if (
    manufacturer.includes('silicon labs') ||
    manufacturer.includes('ftdi') ||
    manufacturer.includes('wch') ||
    path.includes('ttyusb')
  )
    score += 60;

  if (path.includes('bluetooth') || path.includes('wireless')) score -= 80;

  return score;
}

async function resolveSerialPort() {
  const ports = await SerialPort.list();

  if (!ports.length) return null;

  const ranked = ports
    .map((p) => ({ p, s: scorePort(p) }))
    .sort((a, b) => b.s - a.s);

  if (ranked[0].s < 40) return null;

  return ranked[0].p.path;
}

module.exports = { resolveSerialPort };
