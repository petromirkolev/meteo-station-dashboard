import {
  feelsLikeC,
  heatIndexC,
  addTemperatureSample,
  temperatureTrend,
} from '../helpers/tempHelpers.js';

import {
  dewPointC,
  comfortLabel,
  addHumiditySample,
  humidityTrend,
} from '../helpers/humidityHelpers.js';

import {
  addPressureSample,
  pressureDeltaHpa,
  pressureTrend,
} from '../helpers/pressureHelpers.js';

/**
 * Controller function to process incoming meteorological data messages
 * and return formatted data for the dashboard.
 * @param {Object} msg - Incoming message containing meteorological data.
 * @returns {Object} Formatted data for dashboard display.
 */

const PRESSURE_WINDOW_MS = 60 * 60 * 1000;

function finiteNum(x) {
  return typeof x === 'number' && Number.isFinite(x) ? x : null;
}
function formatFixed(x, digits, fallback) {
  const n = finiteNum(x);
  return n === null ? fallback : n.toFixed(digits);
}
function fmtInt(x, fallback) {
  const n = finiteNum(x);
  return n === null ? fallback : String(Math.round(n));
}
function fmtTime(ts) {
  const t = typeof ts === 'number' ? ts : Date.now();
  return new Date(t).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function controller(msg) {
  const frame = msg?.frame ?? {};
  const ts = typeof msg?.ts === 'number' ? msg.ts : Date.now();
  const tCnum = finiteNum(frame.tC);
  const rhnum = finiteNum(frame.rh);
  const pHpnum = finiteNum(frame.pHpa);
  const gasNum = finiteNum(frame.gasRaw);
  if (pHpnum !== null) addPressureSample(ts, pHpnum);
  if (tCnum !== null) addTemperatureSample(ts, tCnum);
  if (rhnum !== null) addHumiditySample(ts, rhnum);
  const heatIndexNum =
    tCnum !== null && rhnum !== null ? heatIndexC(tCnum, rhnum) : null;
  const feelsLikeNum =
    tCnum !== null && rhnum !== null ? feelsLikeC(tCnum, rhnum) : null;
  const dewPointNum =
    tCnum !== null && rhnum !== null ? dewPointC(tCnum, rhnum) : null;
  const comfort = rhnum !== null ? comfortLabel(rhnum) : 'Unknown';
  const pDeltaNum = pressureDeltaHpa(PRESSURE_WINDOW_MS);
  const pTrend = pressureTrend(PRESSURE_WINDOW_MS);
  const tempTrendLabel = temperatureTrend();
  const humTrendLabel = humidityTrend();

  return {
    time: fmtTime(ts),
    tC: formatFixed(tCnum, 1, '--.-'),
    rh: formatFixed(rhnum, 1, '--.-'),
    pHpa: formatFixed(pHpnum, 1, '----'),
    heatIndex: formatFixed(heatIndexNum, 1, '--.-'),
    feelsLike: formatFixed(feelsLikeNum, 1, '--.-'),
    dewPoint: formatFixed(dewPointNum, 1, '--.-'),
    comfort,
    pressureDelta: formatFixed(pDeltaNum, 2, '--'),
    trend: pTrend ?? 'unknown',
    gasRaw: fmtInt(gasNum, '----'),
    tempTrend: tempTrendLabel ?? 'unknown',
    humTrend: humTrendLabel ?? 'unknown',
  };
}
