# Component Reference

All components are purely presentational — they receive everything they need through props and call callbacks for mutations. There is no component-local satellite or log state.

---

## `Header`

**File:** `src/components/Header.jsx`

Top navigation bar. Always visible. Contains the application logo, FSM lifecycle strip, run identity controls, session timer, cluster health indicator, recording status, and wall clock.

### Props

| Prop | Type | Description |
|---|---|---|
| `globalMetrics` | `object` | `{ state, errors, total, isMixed }` — computed constellation-wide metrics. |
| `runName` | `string` | Editable name segment of the run identifier. |
| `setRunName` | `function` | Setter for `runName`. Input is sanitised (spaces → underscores). |
| `isRecording` | `boolean` | When `true`, the run name input is disabled and a pulsing **Recording** badge is shown. |
| `runId` | `number` | Numeric run counter; rendered zero-padded to 4 digits. |
| `elapsed` | `string` | Session duration string in `HH:MM:SS` format. |
| `currentTime` | `string` | Wall-clock time string (`HH:MM:SS`, 24-hour). |
| `runIdentifier` | `string` | Full identifier string (`{runName}_{runId:04d}`) shown next to the recording badge. |

### Sections

- **Logo** — `Constellation MissionControl` wordmark.
- **FSM Lifecycle Strip** — Four `NEW → INIT → ORBIT → RUN` pills; the active phase is highlighted blue. A `≊` badge appears when `globalMetrics.isMixed` is `true`.
- **Run ID** — Editable text input for the run name, followed by the zero-padded numeric ID.
- **Duration** — Elapsed timer, green when recording, grey when idle.
- **Cluster Health** — `NOMINAL` (green) or `N FAULT(S)` (red + pulsing triangle).
- **Recording badge** — Pulsing red dot + label + `runIdentifier`, only visible while recording.
- **Clock** — Live wall clock, right-aligned.

---

## `SatelliteTable`

**File:** `src/components/SatelliteTable.jsx`

Main content area. Renders a scrollable table of all connected satellite nodes. Rows are pre-sorted by the parent (ERROR satellites first, then by descending FSM rank).

### Props

| Prop | Type | Description |
|---|---|---|
| `sortedSatellites` | `array` | Sorted satellite array from `useAppState`. |
| `selectedSatId` | `string \| null` | ID of the currently selected satellite, or `null`. |
| `setSelectedSatId` | `function` | Selecting a row calls this; clicking the same row again deselects (passes `null`). |
| `globalMetrics` | `object` | Used to show the `!! ACTION REQUIRED` fault badge in the section header. |

### Columns

| Column | Description |
|---|---|
| Canonical Name | State dot + bold name + italic type badge. |
| FSM State | Colour-coded pill matching the FSM state palette. |
| Heartbeat | Green dot if last heartbeat < 5 s ago; red pulsing dot otherwise. |
| Faults | Error count in red, or `—`. |
| Events | Cumulative event count (locale-formatted) or `—`. |
| Last Message | Most recent status string from the satellite. |

### Row highlighting

- **Selected row** — blue-tinted background + left blue border.
- **ERROR row** — subtle red-tinted background; deepens on hover.
- All others — standard hover highlight.

---

## `EventRateChart`

**File:** `src/components/EventRateChart.jsx`

Rolling time-series chart in the right sidebar. Shows per-satellite event deltas over the last ~60 seconds.

### Props

| Prop | Type | Description |
|---|---|---|
| `chartData` | `array` | Array of up to 60 data-point objects `{ t, [satId]: delta }`. |
| `isRecording` | `boolean` | Controls visual state (chart is dimmed while not recording). |

---

## `SatelliteInspector`

**File:** `src/components/SatelliteInspector.jsx`

Lower portion of the right sidebar. Shows detailed information for the currently selected satellite and provides manual FSM controls.

### Props

| Prop | Type | Description |
|---|---|---|
| `selectedSat` | `object \| undefined` | The selected satellite object, or `undefined` if nothing is selected. |
| `setSelectedSatId` | `function` | Used by a close/deselect action. |
| `transitionSingle` | `function` | `(id, targetState) => void` — manually transitions one satellite. |
| `resetSatellite` | `function` | `(id) => void` — ACKs a fault and resets satellite to `NEW`. |
| `addLog` | `function` | Allows the inspector to emit log entries for manual actions. |

### Behaviour

- Renders a placeholder when no satellite is selected.
- Shows available FSM transitions as buttons (derived from `STATES[currentState].transitions`).
- Shows a **Reset** button when the satellite is in `ERROR` state.
- Displays the satellite's per-node log entries.

---

## `ControlPanel`

**File:** `src/components/ControlPanel.jsx`

Left portion of the footer. Contains buttons for constellation-wide FSM transitions, recording session management (start / stop), and top-level metrics summary.

### Props

| Prop | Type | Description |
|---|---|---|
| `globalMetrics` | `object` | Used to decide which transition buttons to enable. |
| `transitionAll` | `function` | `(targetState) => void` — broadcasts a state transition to all satellites. |
| `isRecording` | `boolean` | Controls start/stop button label and style. |
| `setIsRecording` | `function` | Toggles recording state. |
| `setStartTime` | `function` | Sets the `Date.now()` reference for elapsed calculation on recording start; `null` on stop. |
| `setRunId` | `function` | Auto-increments the run ID when a new recording starts. |
| `setElapsed` | `function` | Resets elapsed display to `00:00:00` when recording stops. |

---

## `Observatory`

**File:** `src/components/Observatory.jsx`

Scrollable log stream occupying the main footer tab. Supports multi-axis filtering.

### Props

| Prop | Type | Description |
|---|---|---|
| `logs` | `array` | Full log array (up to 200 entries, newest first). |
| `setLogs` | `function` | Used by the **Clear** button (rendered in the tab bar inside `App`). |
| `filteredLogs` | `array` | Pre-filtered log array from `useAppState` — rendered in the list. |
| `logFilter` | `object` | `{ level, sender, topic, text }` — current filter values. |
| `setLogFilter` | `function` | Updates any combination of filter keys. |
| `uniqueSenders` | `array` | `['ALL', ...uniqueSenderNames]` — populates the sender dropdown. |

### Filter axes

| Axis | Options |
|---|---|
| Level | `ALL`, `STATUS`, `INFO`, `WARNING`, `CRITICAL` |
| Sender | `ALL` + any sender name seen in the log stream |
| Topic | `ALL`, `FSM`, `LINK`, `DATA`, `CMD` |
| Text | Free-text substring match on message and sender fields |

---

## `ConfigTab`

**File:** `src/components/ConfigTab.jsx`

INI-style configuration editor in the second footer tab. Allows the operator to edit configuration text and auto-generate it from the live constellation state.

### Props

| Prop | Type | Description |
|---|---|---|
| `configText` | `string` | The current INI configuration string shown in the editor. |
| `setConfigText` | `function` | Updates the config string when the operator edits the textarea. |
| `deduceConfig` | `function` | `() => void` — replaces `configText` with a config auto-generated from live satellite state. |
| `addLog` | `function` | Used to emit an `INFO` log entry after deduction runs. |
