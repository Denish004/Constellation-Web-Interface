# Architecture

## Overview

Constellation Web Interface is a single-page React application. All application state is centralised in one custom hook (`useAppState`) and passed down as props to purely presentational components. There is no external store, router, or server — the app runs entirely in the browser.

---

## Directory layout

```
src/
├── main.jsx               # Entry point — mounts <App />
├── App.jsx                # Root layout — composes all panels
├── constants.js           # Static data & shared helpers
├── hooks/
│   └── useAppState.js     # Single source of truth for all state
└── components/
    ├── Header.jsx
    ├── SatelliteTable.jsx
    ├── EventRateChart.jsx
    ├── SatelliteInspector.jsx
    ├── ControlPanel.jsx
    ├── Observatory.jsx
    └── ConfigTab.jsx
```

---

## Layout structure

```
┌─────────────────────────────────────────────────────┐
│  Header  (h-12)                                     │
│  FSM strip · Run ID · Timer · Cluster health · Clock│
├──────────────────────────────┬──────────────────────┤
│                              │  EventRateChart       │
│   SatelliteTable             ├──────────────────────┤
│   (flex-1, scrollable)       │  SatelliteInspector  │
│                              │  (w-80)              │
├─────────┬────────────────────┴──────────────────────┤
│         │  Footer tabs  (h-56)                      │
│ Control │─────────────────────────────────────────  │
│ Panel   │  [Observatory | Configuration]            │
│         │                          [Active Faults]  │
└─────────┴──────────────────────────────────────────┘
```

- **Header** — fixed height top bar; always visible.  
- **main** — `flex-1`, fills remaining vertical space.  
  - `SatelliteTable` — takes all horizontal space not used by the inspector sidebar.  
  - Aside (`w-80`) — stacks `EventRateChart` above `SatelliteInspector`.  
- **Footer** — fixed height (`h-56`), horizontal flex.  
  - `ControlPanel` — left section with global action buttons.  
  - Tab area — switchable between `Observatory` and `ConfigTab`.  
  - **Active Faults sidebar** (`w-72`) — only rendered when `globalMetrics.errors > 0`.

---

## Data flow

```
useAppState  ──props──▶  Header
             ──props──▶  SatelliteTable
             ──props──▶  EventRateChart
             ──props──▶  SatelliteInspector
             ──props──▶  ControlPanel
             ──props──▶  Observatory
             ──props──▶  ConfigTab
```

All mutations go through callback functions (`addLog`, `transitionAll`, `transitionSingle`, `resetSatellite`, `deduceConfig`) that are defined inside the hook and passed down as props. Components never hold their own satellite or log state.

---

## Tick loop

A `setInterval` running every **1 second** is responsible for:

1. Updating the wall-clock display (`currentTime`).  
2. Incrementing the recording elapsed timer when `isRecording` is `true`.  
3. Updating each satellite's heartbeat timestamp and — for satellites in `RUN` state — generating a random event delta (20–500 events/tick).  
4. Appending a new data point to the rolling `chartData` array (capped at 60 points ≈ 60 seconds of history).

---

## Key design decisions

| Decision | Rationale |
|---|---|
| Single `useAppState` hook | Keeps all reactive logic in one place; components stay simple and testable. |
| No state manager library | The app has one data domain (satellites + logs); `useState` + `useMemo` + `useCallback` are sufficient. |
| Purely presentational components | Easier to test, replace, or rearrange layout without touching logic. |
| Tailwind CSS utility classes | Rapid dark-theme iteration without a separate CSS file per component. |
| 200-entry log cap & 60-point chart cap | Prevents memory growth during long recording sessions. |
