# Constellation Web Interface

A real-time mission control dashboard for monitoring and operating a satellite constellation. Built with React 19 and Vite, it provides a dark-themed operator interface with live FSM state tracking, event monitoring, log inspection, and per-satellite control.

---

## Features

- **Satellite Registry** — Live table of all connected nodes showing FSM state, heartbeat age, fault count, event throughput, and last status message.
- **FSM Lifecycle Strip** — Visual pipeline in the header reflecting the constellation's current phase: `NEW → INIT → ORBIT → RUN` (with `ERROR` handling).
- **Event Rate Chart** — Rolling 30-second time-series chart of events per satellite.
- **Satellite Inspector** — Sidebar panel showing per-satellite details with controls to trigger individual FSM transitions or reset a node.
- **Control Panel** — Global buttons for constellation-wide state transitions and recording sessions with a run timer.
- **Observatory** — Filterable log stream (by level, sender, topic, and free text) capped at 200 entries.
- **Configuration Editor** — In-browser INI-style config editor with auto-deduction support.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Linting | ESLint 9 |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build for production

```bash
npm run build
```

Output is placed in the `dist/` directory.

### Preview the production build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── App.jsx                   # Root layout — wires all panels together
├── constants.js              # FSM state definitions, initial satellite data, default config
├── main.jsx                  # React entry point
├── hooks/
│   └── useAppState.js        # Central state hook (satellites, logs, metrics, run session)
└── components/
    ├── Header.jsx             # Top bar with FSM strip, run ID, and timer
    ├── SatelliteTable.jsx     # Main satellite registry table
    ├── EventRateChart.jsx     # Rolling event-rate chart
    ├── SatelliteInspector.jsx # Per-satellite detail and control sidebar
    ├── ControlPanel.jsx       # Global transition buttons and recording controls
    ├── Observatory.jsx        # Filtered log viewer
    └── ConfigTab.jsx          # INI configuration editor
```

---

## Satellite FSM States

| State | Description |
|---|---|
| `NEW` | Node registered, not yet initialised |
| `INIT` | Initialisation in progress |
| `ORBIT` | Ready and standing by |
| `RUN` | Actively acquiring / transmitting data |
| `ERROR` | Fault condition — action required |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Documentation

Detailed docs live in the [`docs/`](docs/) folder:

| Document | Contents |
|---|---|
| [architecture.md](docs/architecture.md) | Layout structure, data flow, tick loop, design decisions |
| [components.md](docs/components.md) | Props reference for every component |
| [state.md](docs/state.md) | All state variables, derived state, and action functions |
| [fsm.md](docs/fsm.md) | FSM states, transition rules, error handling, and recovery |
