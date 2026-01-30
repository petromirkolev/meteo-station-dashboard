import { feelsLikeC, heatIndexC } from '../helpers/tempHelpers.js';
import { dewPointC, comfortLabel } from '../helpers/humidityHelpers.js';
import {
  addPressureSample,
  pressureDeltaHpa,
  pressureTrend,
} from '../helpers/pressureHelper.js';

import {
  addTemperatureSample,
  temperatureTrend,
} from '../helpers/tempHelpers.js';

import {
  addHumiditySample,
  humidityTrend,
} from '../helpers/humidityHelpers.js';

/**
 * Process incoming meteorological data message and update samples.
 * @param {Object} msg - Incoming message containing meteorological data.
 * @returns {Object} Processed data including temperature, humidity, pressure, and derived metrics.
 */

export function controller(msg) {
  addPressureSample(new Date(msg.ts).getTime(), msg.frame.pHpa);
  addTemperatureSample(new Date(msg.ts).getTime(), msg.frame.tC);
  addHumiditySample(new Date(msg.ts).getTime(), msg.frame.rh);

  const frame = msg.frame || {};
  const tC = frame.tC || '--';
  const rh = frame.rh || '--';
  const pHpa = frame.pHpa || '--';
  const heatIndex = heatIndexC(tC, rh) || '--';
  const feelsLike = feelsLikeC(tC, rh) || '--';
  const dewPoint = dewPointC(tC, rh) || '--';
  const comfort = comfortLabel(rh) || '--';
  const time = new Date(msg.ts).toLocaleTimeString() || '--';
  const pressureDelta = pressureDeltaHpa() || '--';
  const trend = pressureTrend() || '--';
  const gasRaw = frame.gasRaw || '--';
  const tempTrend = temperatureTrend() || '--';
  const humTrend = humidityTrend() || '--';

  return {
    tC,
    rh,
    pHpa,
    heatIndex,
    feelsLike,
    dewPoint,
    comfort,
    time,
    pressureDelta,
    trend,
    gasRaw,
    tempTrend,
    humTrend,
  };
}
