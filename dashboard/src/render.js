import { controller } from './controller.js';

function renderData(vm) {
  const domData = (tid) => document.querySelector(`[data-testid="${tid}"]`);

  // Hook connection status
  document
    .querySelector('[data-testid="connection-status"] > .dot')
    .classList.add('dot--ok');
  document.querySelector(
    '[data-testid="connection-status"] > .status__label',
  ).textContent = 'CONNECTED';

  // Update dashboard
  domData('last-update').textContent = vm.time;
  domData('temp-value').textContent = vm.tC;
  domData('humidity-value').textContent = vm.rh;
  domData('pressure-value').textContent = vm.pHpa;
  domData('heat-index-value').textContent = vm.heatIndex;
  domData('feels-like-value').textContent = vm.feelsLike;
  domData('dew-point-value').textContent = vm.dewPoint;
  domData('comfort-label').textContent = vm.comfort;
  domData('pressure-delta-value').textContent = vm.pressureDelta;
  domData('pressure-trend-value').textContent = vm.trend;
}

function bindEvents() {
  const wsUrl =
    (location.protocol === 'https:' ? 'wss://' : 'ws://') +
    location.host +
    '/ws';
  const ws = new WebSocket(wsUrl);

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type !== 'frame' || !msg.frame) return;
    const vm = controller(msg);
    renderData(vm);
  });

  document.querySelector('.toggle__knob').addEventListener('click', () => {});
}

export { renderData, bindEvents };
