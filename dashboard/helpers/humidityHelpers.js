'use strict';

const humiditySamples = [];

/**
 * Add a humidity sample
 * @param {number} ts Timestamp in ms
 * @param {number} rh Relative Humidity in %
 * @param {number} keepMs How long to keep samples in ms
 * @returns {void}
 */
function addHumiditySample(ts, rh, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof rh !== 'number' || !Number.isFinite(rh)) return;

  humiditySamples.push({ ts, rh });

  const cutoff = ts - keepMs;

  while (humiditySamples.length && humiditySamples[0].ts < cutoff) {
    humiditySamples.shift();
  }
}

/**
 * Calculate humidity delta over a time window
 * @param {number} windowMs
 * @returns {number|null}
 */
function humidityDelta(windowMs = 60 * 60 * 1000) {
  if (humiditySamples.length < 2) return null;

  const latest = humiditySamples[humiditySamples.length - 1];
  const oldest = humiditySamples[0];

  if (latest.ts - oldest.ts < windowMs) return null;

  const targetTs = latest.ts - windowMs;

  let ref = null;
  for (let i = 0; i < humiditySamples.length; i++) {
    if (humiditySamples[i].ts >= targetTs) {
      ref = humiditySamples[i];
      break;
    }
  }

  if (!ref) return null;

  const d = latest.rh - ref.rh;
  return Number.isFinite(d) ? d : null;
}

/**
 * Determine humidity "state" based on latest sample vs threshold
 * @param {number} thresholdHum Humidity threshold in %
 * @returns {'damping'|'drying'|'stable'|'unknown'}
 */
function humidityTrend(windowMs = 60 * 60 * 1000, thresholdHum = 0) {
  const d = humidityDelta(windowMs);

  if (typeof d !== 'number' || !Number.isFinite(d)) return 'unknown';

  if (d > thresholdHum) return 'damping';
  if (d < thresholdHum) return 'drying';
  return 'stable';
}

/**
 * Calculate dew point in Celsius
 * @param {number} tC Temperature in Celsius
 * @param {number} rh Relative Humidity in %
 * @returns {number|null}
 */
function dewPointC(tC, rh) {
  if (typeof tC !== 'number' || typeof rh !== 'number') return null;
  if (!Number.isFinite(tC) || !Number.isFinite(rh)) return null;
  if (rh <= 0 || rh > 100) return null;

  const a = 17.62;
  const b = 243.12;
  const gamma = (a * tC) / (b + tC) + Math.log(rh / 100);
  const dp = (b * gamma) / (a - gamma);

  return Number.isFinite(dp) ? dp : null;
}

/**
 * Get comfort label based on relative humidity
 * @param {number} rh
 * @returns {'Dry'|'OK'|'Humid'}
 */
function comfortLabel(rh) {
  const n = Number(rh);

  if (n < 30) return 'Dry';
  if (n > 60) return 'Humid';
  return 'OK';
}

export { dewPointC, comfortLabel, addHumiditySample, humidityTrend };
