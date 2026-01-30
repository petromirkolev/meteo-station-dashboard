const pressureSamples = [];

/**
 * Add a pressure sample
 * @param ts Timestamp in ms
 * @param pHpa Pressure in hPa
 * @param keepMs How long to keep samples in ms
 * @returns {void}
 */

function addPressureSample(ts, pHpa, keepMs = 3 * 60 * 60 * 1000) {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) return;
  if (typeof pHpa !== 'number' || !Number.isFinite(pHpa)) return;

  pressureSamples.push({ ts, pHpa });

  // Remove old samples
  const cutoff = ts - keepMs;
  while (pressureSamples.length && pressureSamples[0].ts < cutoff) {
    pressureSamples.shift();
  }
}

/**
 * Calculate pressure delta over a time window
 * @param windowMs Time window in ms
 * @returns {number|null} Pressure delta in hPa or null if not enough data
 */

function pressureDeltaHpa(windowMs = 60 * 60 * 1000) {
  if (pressureSamples.length < 2) return null;

  const latest = pressureSamples[pressureSamples.length - 1];
  const targetTs = latest.ts - windowMs;

  let ref = null;
  for (let i = 0; i < pressureSamples.length; i++) {
    if (pressureSamples[i].ts >= targetTs) {
      ref = pressureSamples[i];
      break;
    }
  }

  if (!ref) return null;
  return (latest.pHpa - ref.pHpa).toFixed(1);
}

/** Determine pressure trend
 * @param windowMs Time window in ms
 * @param thresholdHpa Threshold in hPa to consider as rising/falling
 * @returns {'rising'|'falling'|'stable'|'unknown'} Pressure trend
 */

function pressureTrend(windowMs = 60 * 60 * 1000, thresholdHpa = 0.8) {
  const d = pressureDeltaHpa(windowMs);
  if (typeof d !== 'number' || !Number.isFinite(d)) return 'unknown';
  if (d > thresholdHpa) return 'rising';
  if (d < -thresholdHpa) return 'falling';
  return 'stable';
}

export { addPressureSample, pressureDeltaHpa, pressureTrend };
