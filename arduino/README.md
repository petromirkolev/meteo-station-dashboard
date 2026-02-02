# Arduino Serial NDJSON v1 (DHT11 + BMP280 + MQ2)

This sketch is the Phase 1 hardware contract for the Meteo Station Dashboard.

It reads:

- **DHT11** for temperature + humidity
- **BMP280** (I2C @ "0x76") for pressure + temperature
- **MQ2 gas sensor** for a raw “gas index” (analog)

It outputs **newline-delimited JSON (NDJSON)** over USB Serial, designed to be consumed by the Node bridge and Replay Mode.

---

## Output contract (NDJSON)

Baud rate: "115200"

One JSON object per line, every ~1 second:

Example frame:

```json
{ "v": 1, "tC": 27.3, "rh": 35.0, "pHpa": 977.5, "tBmp": 27.3, "gasRaw": 22 }
```
