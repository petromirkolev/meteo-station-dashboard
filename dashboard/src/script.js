import { controller } from './controller.js';
import { renderData } from './render.js';

const wsUrl =
  (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
const ws = new WebSocket(wsUrl);

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type !== 'frame' || !msg.frame) return;
  const vm = controller(msg);
  renderData(vm);
});
