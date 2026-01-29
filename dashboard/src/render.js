function renderData(msg) {
  const domData = (tid) => document.querySelector(`[data-testid="${tid}"]`);

  const f = msg.frame;
  const HI = heatIndexC(f.tC.toFixed(1), f.rh.toFixed(1));
  const feelsLike = feelsLikeC(f.tC.toFixed(1), f.rh.toFixed(1));

  document.querySelector(
    '[data-testid="last-update"] > .chip__text',
  ).textContent = new Date(msg.ts).toLocaleTimeString();

  if (typeof f.tC === 'number')
    domData('temp-value').textContent = f.tC.toFixed(1);
  if (typeof f.rh === 'number')
    domData('humidity-value').textContent = f.rh.toFixed(1);
  if (typeof f.pHpa === 'number')
    domData('pressure-value').textContent = f.pHpa.toFixed(1);
  if (typeof HI === 'number')
    domData('heat-index-value').textContent = HI.toFixed(1);
  if (typeof feelsLike === 'number')
    domData('feels-like-value').textContent = feelsLike.toFixed(1);
}

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
  return hiC;
}

function feelsLikeC(tC, rh) {
  const hi = heatIndexC(tC, rh);
  if (typeof hi === 'number') {
    return Math.max(tC, hi);
  }
  return tC;
}

export { renderData };
