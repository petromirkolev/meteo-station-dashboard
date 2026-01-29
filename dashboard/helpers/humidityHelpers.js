function dewPointC(tC, rh) {
  if (typeof tC !== 'number' || typeof rh !== 'number') return null;
  if (!Number.isFinite(tC) || !Number.isFinite(rh)) return null;
  if (rh <= 0 || rh > 100) return null;

  const a = 17.62;
  const b = 243.12; // °C
  const gamma =
    (a * Number(tC)) / (b + Number(tC)) + Math.log(Number(rh) / 100);
  return (b * gamma) / (a - gamma);
}

function comfortLabel(rh) {
  if (Number(rh) < 30) return 'Dry';
  if (Number(rh) <= 60) return 'OK';
  return 'Humid';
}

export { dewPointC, comfortLabel };
