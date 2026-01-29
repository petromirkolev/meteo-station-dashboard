const pressureSamples = [];

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
  return latest.pHpa - ref.pHpa;
}

function pressureTrend(windowMs = 60 * 60 * 1000, thresholdHpa = 0.8) {
  const d = pressureDeltaHpa(windowMs);
  if (typeof d !== 'number' || !Number.isFinite(d)) return 'unknown';
  if (d > thresholdHpa) return 'rising';
  if (d < -thresholdHpa) return 'falling';
  return 'stable';
}

export { addPressureSample, pressureDeltaHpa, pressureTrend };
