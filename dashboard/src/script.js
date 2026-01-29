import { renderData } from './render.js';

const wsUrl =
  (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
const ws = new WebSocket(wsUrl);

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type !== 'frame') return;
  renderData(msg);
});
