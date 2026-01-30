const temperatureSamples = [];

/**
 * Adds a temperature sample to the list
 * @param ts - Timestamp in ms
 * @param tC - Temperature in C
 * @param keepMs - How long to keep samples in ms
 */

function addTemperatureSample(ts, tC, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof tC !== 'number' || !Number.isFinite(tC)) return;

  temperatureSamples.push({ ts, tC });

  // Remove old samples
  const cutoff = ts - keepMs;
  while (temperatureSamples.length && temperatureSamples[0].ts < cutoff) {
    temperatureSamples.shift();
  }
}

/**
 * Determines the temperature trend based on the latest sample
 * @param thresholdTemp - The threshold temperature to determine trend
 * @returns 'rising', 'falling', 'stable', or 'unknown'
 */

function temperatureTrend(thresholdTemp = 22) {
  const temperature = temperatureSamples[temperatureSamples.length - 1];

  if (typeof temperature.tC !== 'number' || !Number.isFinite(temperature.tC))
    return 'unknown';

  if (temperature.tC > thresholdTemp) return 'rising';
  if (temperature.tC < thresholdTemp) return 'falling';
  return 'stable';
}

/**
 * Calculates the heat index in Celsius
 * @param tC - Temperature in C
 * @param rh - Relative humidity
 * @returns the heat index in C
 */

function heatIndexC(tC, rh) {
  const tF = (tC * 9) / 5 + 32;
  const R = rh;
  let hiF =
    -42.379 +
    2.04901523 * tF +
    10.14333127 * R -
    0.22475541 * tF * R -
    0.00683783 * tF * tF -
    0.05481717 * R * R +
    0.00122874 * tF * tF * R +
    0.00085282 * tF * R * R -
    0.00000199 * tF * tF * R * R;

  if (R < 13 && tF >= 80 && tF <= 112) {
    hiF -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
  } else if (R > 85 && tF >= 80 && tF <= 87) {
    hiF += ((R - 85) / 10) * ((87 - tF) / 5);
  }

  const hiC = ((hiF - 32) * 5) / 9;
  return hiC || '--';
}

/**
 * Calculates the 'feels like' temperature in Celsius
 * @param tC - Temperature in C
 * @param rh - Relative humidity
 * @returns the 'feels like' temperature in C
 */

function feelsLikeC(tC, rh) {
  const hi = heatIndexC(tC, rh);
  if (typeof hi === 'number') {
    return Math.max(tC, hi);
  }
  return tC;
}

export { feelsLikeC, heatIndexC, addTemperatureSample, temperatureTrend };
