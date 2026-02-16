'use strict';

const pressureSamples = [];

/**
 * Add a pressure sample
 * @param {number} ts Timestamp in ms
 * @param {number} pHpa Pressure in hPa
 * @param {number} keepMs How long to keep samples in ms
 * @returns {void}
 */
function addPressureSample(ts, pHpa, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof pHpa !== 'number' || !Number.isFinite(pHpa)) return;

  pressureSamples.push({ ts, pHpa });

  const cutoff = ts - keepMs;
  while (pressureSamples.length && pressureSamples[0].ts < cutoff) {
    pressureSamples.shift();
  }
}

/**
 * Calculate pressure delta over a time window
 * @param {number} windowMs
 * @returns {number|null}
 */
function pressureDelta(windowMs = 60 * 60 * 1000) {
  if (pressureSamples.length < 2) return null;

  const latest = pressureSamples[pressureSamples.length - 1];
  const oldest = pressureSamples[0];

  if (latest.ts - oldest.ts < windowMs) return null;

  const targetTs = latest.ts - windowMs;

  let ref = null;
  for (let i = 0; i < pressureSamples.length; i++) {
    if (pressureSamples[i].ts >= targetTs) {
      ref = pressureSamples[i];
      break;
    }
  }

  if (!ref) return null;

  const d = latest.pHpa - ref.pHpa;
  return Number.isFinite(d) ? d : null;
}

/**
 * Determine pressure trend based on delta
 * @param {number} windowMs
 * @param {number} thresholdHpa
 * @returns {'rising'|'falling'|'stable'|'unknown'}
 */
function pressureTrend(windowMs = 60 * 60 * 1000, thresholdHpa = 0) {
  const d = pressureDelta(windowMs);
  if (typeof d !== 'number' || !Number.isFinite(d)) return 'unknown';

  if (d > thresholdHpa) return 'rising';
  if (d < -thresholdHpa) return 'falling';
  return 'stable';
}

export { addPressureSample, pressureDelta, pressureTrend };
