const humiditySamples = [];

/**
 * Add a humidity sample
 * @param ts Timestamp in ms
 * @param rh Relative Humidity in %
 * @param keepMs How long to keep samples in ms
 * @returns {void}
 */

function addHumiditySample(ts, rh, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof rh !== 'number' || !Number.isFinite(rh)) return;

  humiditySamples.push({ ts, rh });

  // Remove old samples
  const cutoff = ts - keepMs;
  while (humiditySamples.length && humiditySamples[0].ts < cutoff) {
    humiditySamples.shift();
  }
}

/**
 * Determine humidity trend based on the latest sample
 * @param thresholdHum Humidity threshold in %
 * @returns {string} 'rising', 'falling', 'stable', or 'unknown'
 */

function humidityTrend(thresholdHum = 50) {
  const humidity = humiditySamples[humiditySamples.length - 1];

  if (typeof humidity.rh !== 'number' || !Number.isFinite(humidity.rh))
    return 'unknown';

  if (humidity.rh > thresholdHum) return 'rising';
  if (humidity.rh < thresholdHum) return 'falling';
  return 'stable';
}

/**
 * Calculate dew point in Celsius
 * @param tC Temperature in Celsius
 * @param rh Relative Humidity in %
 * @returns {number|null} Dew point in Celsius or null if inputs are invalid
 */

function dewPointC(tC, rh) {
  if (typeof tC !== 'number' || typeof rh !== 'number') return null;
  if (!Number.isFinite(tC) || !Number.isFinite(rh)) return null;
  if (rh <= 0 || rh > 100) return null;

  const a = 17.62;
  const b = 243.12; // °C
  const gamma =
    (a * Number(tC)) / (b + Number(tC)) + Math.log(Number(rh) / 100);
  return ((b * gamma) / (a - gamma)).toFixed(1);
}

/**
 * Get comfort label based on relative humidity
 * @param rh Relative Humidity in %
 * @returns {string} 'Dry', 'OK', or 'Humid'
 */

function comfortLabel(rh) {
  if (Number(rh) < 30) return 'Dry';
  if (Number(rh) <= 60) return 'OK';
  return 'Humid';
}

export { dewPointC, comfortLabel, addHumiditySample, humidityTrend };
