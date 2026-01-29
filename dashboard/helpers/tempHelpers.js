/**
 * Calculates the heat index
 * @param tC - Temperature in C
 * @param rh - Relative humidity
 * @returns heat index
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
  return hiC;
}
/**
 * Calculates the feels like temperature
 * @param tC - Temperature in C
 * @param rh - Relative humidity
 * @returns the feels like temperature
 */
function feelsLikeC(tC, rh) {
  const hi = heatIndexC(tC, rh);
  if (typeof hi === 'number') {
    return Math.max(tC, hi);
  }
  return tC;
}

export { feelsLikeC, heatIndexC };
