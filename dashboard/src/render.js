import { controller } from './controller.js';

/**
 * Bind WebSocket events to update the dashboard in real-time.
 * Establishes a WebSocket connection to the server and listens for messages.
 * On receiving a message of type 'frame', it processes the data through the controller
 * and updates the dashboard UI accordingly.
 * @function bindEvents
 * @returns {void}
 */

function bindEvents() {
  const wsUrl =
    (location.protocol === 'https:' ? 'wss://' : 'ws://') +
    location.host +
    '/ws';
  const ws = new WebSocket(wsUrl);

  //  Handle WebSocket open event
  ws.addEventListener('open', () => {
    document
      .querySelector('[data-testid="connection-status"] > .dot')
      .classList.add('dot--ok');
    document.querySelector(
      '[data-testid="connection-status"] > .status__label',
    ).textContent = 'CONNECTED';
  });
  //  Handle WebSocket close event
  ws.addEventListener('close', () => {
    document
      .querySelector('[data-testid="connection-status"] > .dot')
      .classList.remove('dot--ok');
    document.querySelector(
      '[data-testid="connection-status"] > .status__label',
    ).textContent = 'DISCONNECTED';
  });
  //  Handle incoming WebSocket messages
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type !== 'frame' || !msg.frame) return;
    const vm = controller(msg);
    renderData(vm);
  });
}

/**
 * Render the dashboard data.
 * Updates various elements of the dashboard with the latest data from the view model (vm).
 * @function renderData
 * @param {Object} vm - The view model containing the latest data to be displayed.
 * @returns {void}
 */

function renderData(vm) {
  const domData = (tid) => document.querySelector(`[data-testid="${tid}"]`);

  // Update DOM elements with data from the view model
  domData('last-update').textContent = vm.time;
  domData('temp-value').textContent = vm.tC;
  domData('badge-temp-state').textContent = vm.tempTrend;
  domData('humidity-value').textContent = vm.rh;
  domData('heat-index-value').textContent = vm.heatIndex;
  domData('feels-like-value').textContent = vm.feelsLike;
  domData('dew-point-value').textContent = vm.dewPoint;
  domData('comfort-label').textContent = vm.comfort;
  domData('pressure-value').textContent = vm.pHpa;
  domData('pressure-delta-value').textContent = vm.pressureDelta;
  domData('pressure-trend-value').textContent = domData(
    'badge-pressure-trend',
  ).textContent = vm.trend;
  domData('eco2-value').textContent = vm.gasRaw;
  domData('tvoc-value').textContent = vm.gasRaw;
  domData('pm25-value').textContent = vm.gasRaw;
  domData('badge-comfort').textContent = vm.humTrend;
}

export { bindEvents };
