# Meteo Station Dashboard

Real-time **Meteo + Comfort + Air/Noise** dashboard with **Replay Mode** (CI-safe, no hardware required).

## Core idea

- **Live Mode:** Arduino → USB Serial (NDJSON) → Node bridge → WebSocket → Dashboard
- **Replay Mode:** Dataset file (NDJSON) → Node bridge → WebSocket → Dashboard

## Features

### Raw metrics (current / planned)

- Temperature (°C)
- Humidity (%)
- Pressure (hPa)
- Gas/Air index
- (Planned) Light
- (Planned) Noise index + spike events

### Derived metrics (dashboard)

- Humidity trend and dew point
- Heat index and “feels like”
- Comfort label (dry/ok/humid)
- Pressure trend (rising/falling/stable) and delta

## Tech stack

### Hardware

- Arduino UNO R4 Minima
- Sensors (current): **BMP280 + DHT11 + MQ2**
- Sensors (planned): light + sound

### Firmware (Arduino)

- Arduino IDE sketch (".ino")
- Outputs **NDJSON** over USB Serial (one JSON object per line)

### Bridge (Node.js)

- Node.js (CommonJS) + "ws" WebSocket server
- Reads Serial via "serialport" (Live Mode)
- Streams datasets from file (Replay Mode)
- Broadcasts via WebSocket ("ws")

### Dashboard (Web)

- HTML/CSS + JavaScript (ES modules)

### Testing

- E2E tests: Playwright + TypeScript
- Playwright runs **only in Replay Mode** (CI-safe)

## Repo structure

- "dashboard/" — frontend UI (served by the bridge)
- "bridge/" — Node server (static + WebSocket + replay/live + recording)
  - "bridge/lib/" — modular bridge logic (replay, recording, live serial, config, etc.)
- "replay/" — NDJSON data
  - "replay/sample.ndjson" — default replay data
  - "replay/fixtures/" — test fixtures (deterministic inputs)
  - "replay/recordings/" — recorded sessions (created by the bridge)
- "tests/" — Playwright E2E (TypeScript)

## System contract (SensorFrame v1)

Arduino emits one JSON object per line (NDJSON), versioned for forward compatibility:

```json
{ "v": 1, "tC": 27.3, "rh": 35.0, "pHpa": 977.5, "tBmp": 27.3, "gasRaw": 22 }
```

Fields:

- v (number): schema version (currently 1)

- tC (number|null): DHT temperature °C

- rh (number|null): DHT humidity %

- pHpa (number|null): BMP280 pressure hPa

- tBmp (number|null): BMP280 temperature °C (debug/sanity)

- gasRaw (number): MQ analog raw reading (index, not ppm)

The bridge broadcasts JSON messages:

- "{ type: "hello", ts, source }"
- "{ type: "state", mode, recording, recordFile }"
- "{ type: "frame", ts, source: "replay" | "live", frame: {...} }"

Dashboard responsibilities:

- Renders raw + derived metrics from incoming "frame" messages.

## Getting started

Prereqs

- Node.js (bridge + dashboard dev server)

- Modern browser

Optional: Arduino IDE (Live Mode only)

- Run (Replay Mode) — recommended for UI + tests

### From the repo root

# 1) start the bridge in replay mode

```bash
npm install
npm run dash:replay
```

# 2) start the dashboard dev server

```bash
npm install
npm run dash:dev
```

# 3) flash the sketch in /arduino (outputs NDJSON @ 115200)

# 4) start live mode (port detection is automatic, if not, see below)

```bash
npm run dash:live
```

# 5) see available ports for manual use

```bash
npm run ports
```

# 6) start live mode with explicit port (example)

```bash
SERIAL_PORT=/dev/cu.usbmodemXXXX npm run dash:live
```

Tests (Replay Mode only)

```bash
cd tests
npm install
npx playwright install
npm run pw:smoke
npm run pw:replay
npm run pw:formatting
npm run pw:derived:hi
npm run pw:derived:dew
npm run pw:derived:comfort
npm run pw:derived:trends
npm run pw:state
npm run pw:resilience
npm run pw:load
```

Note: command names may change as the repo matures; the principle stays: Replay Mode is the default dev/test path.

## Roadmap

Tier 0:

- NDJSON v1 contract

- Live + Replay pipeline

- Dashboard tiles: temp/humidity/pressure/gas index

- Derived: dew point, heat index, comfort label, pressure trend

- Event log + basic alerts

Tier 1:

- Light sensor (lux)

- Sound/noise index + spike detection

- Better gas normalization (baseline + delta + cooldown)

Tier 2:

- PM2.5 sensor (e.g. PMS5003 or SEN55)

- Real CO₂ sensor (e.g. SCD41)

- Ventilation label + alerts based on real CO₂/PM
