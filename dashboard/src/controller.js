import { feelsLikeC, heatIndexC } from '../helpers/tempHelpers.js';
import { dewPointC, comfortLabel } from '../helpers/humidityHelpers.js';
import {
  addPressureSample,
  pressureDeltaHpa,
  pressureTrend,
} from '../helpers/pressureHelper.js';

export function controller(msg) {
  addPressureSample(new Date(msg.ts).getTime(), msg.frame.pHpa);

  const frame = msg.frame;
  const tC = Number(frame.tC.toFixed(1));
  const rh = Number(frame.rh.toFixed(1));
  const pHpa = Number(frame.pHpa.toFixed(1));
  const heatIndex = heatIndexC(tC, rh).toFixed(1);
  const feelsLike = feelsLikeC(tC, rh).toFixed(1);
  const dewPoint = dewPointC(tC, rh).toFixed(1);
  const comfort = comfortLabel(rh);
  const time = new Date(msg.ts).toLocaleTimeString();
  const pressureDelta = pressureDeltaHpa().toFixed(2);
  const trend = pressureTrend();
  const gasRaw = Number(frame.gasRaw.toFixed(1));

  return {
    tC,
    rh,
    pHpa,
    heatIndex,
    feelsLike,
    dewPoint,
    comfort,
    time,
    pressureDelta,
    trend,
    gasRaw,
  };
}
