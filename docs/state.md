# State Management

All application state is owned by the `useAppState` hook (`src/hooks/useAppState.js`). `App.jsx` calls the hook once and distributes slices to child components via props.

---

## Raw state

| Variable | Type | Initial value | Description |
|---|---|---|---|
| `satellites` | `Satellite[]` | `INITIAL_SATELLITES` | Array of all node objects. |
| `logs` | `Log[]` | `[]` | Global log stream, newest-first, capped at 200. |
| `selectedSatId` | `string \| null` | `null` | ID of the row selected in `SatelliteTable`. |
| `runId` | `number` | `42` | Numeric part of the run identifier, auto-incremented on each new recording. |
| `runName` | `string` | `'cosmic_ray'` | Editable name segment of the run identifier. |
| `isRecording` | `boolean` | `false` | Whether a recording session is active. |
| `startTime` | `number \| null` | `null` | `Date.now()` at the moment recording started; `null` when idle. |
| `elapsed` | `string` | `'00:00:00'` | Formatted elapsed session time, updated every second. |
| `currentTime` | `string` | `''` | Wall-clock time string, updated every second. |
| `footerTab` | `string` | `'observatory'` | Active tab in the footer: `'observatory'` or `'config'`. |
| `logFilter` | `object` | `{ level:'ALL', sender:'ALL', topic:'ALL', text:'' }` | Current Observatory filter state. |
| `configText` | `string` | `DEFAULT_CONFIG` | The INI configuration text shown in the editor. |
| `chartData` | `object[]` | 30 zero-points | Rolling array of `{ t, [satId]: delta }` objects, max 60 points. |

---

## Satellite object shape

```js
{
  id:        string,    // unique identifier ('1'–'6')
  type:      string,    // producer type, e.g. 'Sputnik', 'EudaqNativeWriter'
  name:      string,    // canonical name, e.g. 'Sputnik.One'
  state:     string,    // FSM state key — 'NEW' | 'INIT' | 'ORBIT' | 'RUN' | 'ERROR'
  heartbeat: number,    // Date.now() timestamp of last heartbeat update
  msg:       string,    // most recent status message
  errors:    number,    // cumulative fault count
  logs:      Log[],     // per-satellite log entries, newest-first, max 30
  events:    number,    // cumulative event count
  _delta:    number,    // transient — events generated in the last tick (not stored)
}
```

---

## Log object shape

```js
{
  id:        string,  // random 9-char alphanumeric
  timestamp: string,  // 'HH:MM:SS' (24-hour)
  level:     string,  // 'STATUS' | 'INFO' | 'WARNING' | 'CRITICAL'
  sender:    string,  // canonical satellite name or 'MissionControl'
  message:   string,  // human-readable description
  topic:     string,  // 'FSM' | 'LINK' | 'DATA' | 'CMD'
}
```

---

## Derived state (memoised)

| Variable | Dependencies | Description |
|---|---|---|
| `globalMetrics` | `satellites` | `{ state, errors, total, isMixed }` — constellation-wide summary. `state` is the lowest non-error FSM state by rank. `isMixed` is `true` when non-error satellites are not all in the same state. |
| `selectedSat` | `satellites`, `selectedSatId` | The satellite object whose `id === selectedSatId`, or `undefined`. |
| `sortedSatellites` | `satellites` | Copy of `satellites` sorted: `ERROR` first, then descending by FSM rank. |
| `filteredLogs` | `logs`, `logFilter` | `logs` with all four filter axes applied. |
| `uniqueSenders` | `logs` | `['ALL', ...deduplicated sender names]`. |
| `runIdentifier` | `runName`, `runId` | `"{runName}_{runId:04d}"` — the full recording label. |

---

## Actions

### `addLog(level, sender, message, topic?)`

Prepends a new `Log` entry to the global `logs` array (capped at 200) and to the matching satellite's `logs` slice (capped at 30).

| Param | Type | Default |
|---|---|---|
| `level` | `'STATUS' \| 'INFO' \| 'WARNING' \| 'CRITICAL'` | — |
| `sender` | `string` | — |
| `message` | `string` | — |
| `topic` | `'FSM' \| 'LINK' \| 'DATA' \| 'CMD'` | `'FSM'` |

---

### `transitionAll(targetState)`

Broadcasts a FSM transition to **all** satellites simultaneously.

- Satellites already in `ERROR` are skipped unless `targetState` is `'NEW'` or `'INIT'`.
- `EudaqNativeWriter` nodes have a ~15 % chance of entering `ERROR` when `targetState` is `'INIT'` (simulates a configuration fault).
- Emits a `STATUS`/`FSM` log entry for each satellite and a `STATUS`/`CMD` entry from `'MissionControl'`.

---

### `transitionSingle(id, targetState)`

Transitions exactly one satellite identified by `id`.

- Resets `errors` to `0` when `targetState` is `'NEW'`.
- Emits a `STATUS`/`CMD` log entry from the satellite's name.

---

### `resetSatellite(id)`

Forces a satellite to `NEW` state, clears its `errors` counter, and sets `msg` to `'Manual reset via ACK'`. This is the same action triggered by the **ACK / RESET** button in the Active Faults sidebar.

Emits a `WARNING`/`CMD` log entry from `'MissionControl'`.

---

### `deduceConfig()`

Generates a new INI config string from the **live** satellite state and writes it to `configText`. The generated config includes:
- A `[_default]` section header.
- One section per satellite with commented `state` and `faults` annotations.
- `_data.receive_from` key for `EudaqNativeWriter` satellites.
- `interval` key for `Sputnik` satellites.

Emits an `INFO`/`CMD` log entry from `'MissionControl'`.

---

## Tick loop

A single `setInterval(fn, 1000)` effect (dependencies: `[isRecording, startTime]`) drives:

1. Wall-clock update → `setCurrentTime`.
2. Elapsed timer update → `setElapsed` (only when `isRecording && startTime`).
3. Heartbeat refresh for all non-error satellites (with a 3 % random miss to simulate network jitter for non-RUN satellites).
4. Random event delta generation for `RUN` satellites (20–500 events/tick) → accumulated into `satellite.events`.
5. New chart data point appended to `chartData`; array trimmed to 60 points.
