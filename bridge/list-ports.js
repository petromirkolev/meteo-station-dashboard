const { SerialPort } = require('serialport');

async function main() {
  const ports = await SerialPort.list();

  if (!ports.length) {
    return;
  }
  ports.forEach((port) => console.log(port.path));
}

main().catch((e) => {
  console.error('Failed to list ports:', e.message);
  process.exit(1);
});
