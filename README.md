# Meteo Station Dashboard (Arduino → Serial → Node → WebSocket → Web UI)

A real-time “Meteo + Comfort + Air/Noise” dashboard with a deterministic Replay Mode for CI-safe testing.

## What it does

Live pipeline:
Arduino → USB Serial (newline-delimited JSON) → Node.js bridge → WebSocket → Web dashboard

Dashboard shows:

- Raw: temperature (°C), humidity (%), pressure (hPa), light level, noise index, and air quality
- Derived: dew point, heat index / “feels like”, comfort label, pressure trend, noise spike events
- Alerts + event log

Key constraint:

- **Replay Mode** runs the entire dashboard without hardware using recorded datasets (same schema as live).

## Tech stack

Hardware

- Arduino UNO R4 Minima + modular sensor kit (I2C + analog sensors)

Firmware (Arduino)

- Arduino IDE sketch (".ino")
- Arduino C++ + sensor libraries
- Serial output: newline-delimited JSON (one frame per line)

Bridge (Node.js)

- Node.js + TypeScript
- Serial transport: "serialport" (USB Serial)
- Realtime transport: WebSocket server (e.g. "ws")
- Runtime validation for incoming frames (e.g. "zod") + a shared "SensorFrame" type
- Modes:
  - Live mode: Serial → WebSocket
  - Replay mode: dataset file → WebSocket (CI-safe)

Dashboard (Web)

- TypeScript + HTML + CSS (no framework required)
- WebSocket client for live updates
- UI widgets instrumented with "data-testid" for stable E2E selectors
- Derived-metrics engine (dew point, heat index, comfort labels, trends, alerts)

Testing

- Playwright E2E (runs only in Replay Mode for deterministic CI)
- Optional later: Node bridge tests (unit/integration) for schema + replay parser

## Repo structure

- "arduino/" — Arduino sketch + wiring notes
- "bridge/" — Node serial reader + schema validation + WS server
- "dashboard/" — UI (renders widgets + derived metrics + alerts)
- "replay/" — recorded datasets (newline-delimited JSON frames)
- "docs/" — architecture notes, schema, screenshots
- "tests/" — Playwright E2E (Replay Mode)

## System contract (Phase 1)

Arduino emits **one JSON object per line** over Serial.

Example (shape will be finalized after sensor selection):

```json
{ "t": 23.4, "rh": 41.2, "p": 1012.8, "light": 0.62, "noise": 0.1 }
```
