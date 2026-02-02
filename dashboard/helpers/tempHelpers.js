'use strict';

const temperatureSamples = [];

/**
 * Adds a temperature sample to the list
 * @param {number} ts Timestamp in ms
 * @param {number} tC Temperature in C
 * @param {number} keepMs How long to keep samples in ms
 */
function addTemperatureSample(ts, tC, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof tC !== 'number' || !Number.isFinite(tC)) return;

  temperatureSamples.push({ ts, tC });

  const cutoff = ts - keepMs;

  while (temperatureSamples.length && temperatureSamples[0].ts < cutoff) {
    temperatureSamples.shift();
  }
}

/**
 * Calculate temperature delta over a time window
 * @param {number} windowMs
 * @returns {number|null}
 */
function temperatureDelta(windowMs = 60 * 60 * 1000) {
  if (temperatureSamples.length < 2) return null;

  const latest = temperatureSamples[temperatureSamples.length - 1];
  const oldest = temperatureSamples[0];

  if (latest.ts - oldest.ts < windowMs) return null;

  const targetTs = latest.ts - windowMs;

  let ref = null;
  for (let i = 0; i < temperatureSamples.length; i++) {
    if (temperatureSamples[i].ts >= targetTs) {
      ref = temperatureSamples[i];
      break;
    }
  }

  if (!ref) return null;

  const d = latest.tC - ref.tC;
  return Number.isFinite(d) ? d : null;
}

/**
 * Determines temperature "state" based on latest sample vs threshold
 * @param {number} threshold
 * @returns {'rising'|'falling'|'stable'|'unknown'}
 */
function temperatureTrend(windowMs = 60 * 60 * 1000, thresholdTemp = 0) {
  const d = temperatureDelta(windowMs);

  if (typeof d !== 'number' || !Number.isFinite(d)) return 'unknown';

  if (d > thresholdTemp) return 'warming';
  if (d < thresholdTemp) return 'cooling';
  return 'stable';
}

/**
 * Calculates the heat index in Celsius
 * @param {number} tC
 * @param {number} rh
 * @returns {number|null}
 */
function heatIndexC(tC, rh) {
  if (typeof tC !== 'number' || typeof rh !== 'number') return null;
  if (!Number.isFinite(tC) || !Number.isFinite(rh)) return null;

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
  return Number.isFinite(hiC) ? hiC : null;
}

/**
 * Calculates "feels like" temperature in Celsius
 * @param {number} tC
 * @param {number} rh
 * @returns {number|null}
 */
function feelsLikeC(tC, rh) {
  const hi = heatIndexC(tC, rh);
  if (hi === null) return Number.isFinite(tC) ? tC : null;
  return Math.max(tC, hi);
}

export { feelsLikeC, heatIndexC, addTemperatureSample, temperatureTrend };
