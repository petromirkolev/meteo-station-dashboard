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
 * Determine humidity "state" based on latest sample vs threshold
 * (Not a real trend yet; just a threshold classification.)
 * @param {number} thresholdHum Humidity threshold in %
 * @returns {'rising'|'falling'|'stable'|'unknown'}
 */
function humidityTrend(thresholdHum = 50) {
  const last = humiditySamples[humiditySamples.length - 1];
  if (!last) return 'unknown';
  if (typeof last.rh !== 'number' || !Number.isFinite(last.rh))
    return 'unknown';

  if (last.rh > thresholdHum) return 'rising';
  if (last.rh < thresholdHum) return 'falling';
  return 'stable';
}

/**
 * Calculate dew point in Celsius
 * Returns a NUMBER (no toFixed here — controller formats)
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
  if (!Number.isFinite(n)) return 'OK';
  if (n < 30) return 'Dry';
  if (n <= 60) return 'OK';
  return 'Humid';
}

export { dewPointC, comfortLabel, addHumiditySample, humidityTrend };
