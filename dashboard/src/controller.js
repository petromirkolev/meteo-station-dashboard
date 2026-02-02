'use strict';

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
  pressureDelta,
  pressureTrend,
} from '../helpers/pressureHelpers.js';

/**
 * Controller function to process incoming meteorological data messages
 * and return formatted data for the dashboard.
 * @param {Object} msg - Incoming message containing meteorological data.
 * @returns {Object} Formatted data for dashboard display.
 */

const DELTA_WINDOW_MS = 60 * 1000; // 60 * 60 * 1000 - hour ; 60 * 1000 - minute

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
  const pDeltaNum = pressureDelta(DELTA_WINDOW_MS);
  const pTrend = pressureTrend(DELTA_WINDOW_MS);
  const tempTrendLabel = temperatureTrend(DELTA_WINDOW_MS);
  const humTrendLabel = humidityTrend(DELTA_WINDOW_MS);

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
