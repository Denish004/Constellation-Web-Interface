# FSM Lifecycle

Each satellite node in the constellation operates as a finite state machine (FSM). The UI reflects the live FSM state of every node and provides controls to drive state transitions both individually and cluster-wide.

---

## States

| State | Rank | Colour | Meaning |
|---|---|---|---|
| `NEW` | 0 | Grey | Node is registered but not yet initialised. Default after registration or reset. |
| `INIT` | 1 | Blue | Initialisation sequence is in progress (configuration loading, hardware setup). |
| `ORBIT` | 2 | Purple | Node is fully initialised and standing by. Ready to begin a run. |
| `RUN` | 3 | Emerald/Green | Node is actively acquiring or transmitting data. Heartbeat and events are updated every second. |
| `ERROR` | −1 | Red | Node has encountered a fault condition. Requires operator acknowledgement before it can re-enter the normal lifecycle. |

---

## Allowed transitions

The `transitions` array on each state definition lists the states a node may legally move to:

| From | To |
|---|---|
| `NEW` | `INIT` |
| `INIT` | `ORBIT`, `NEW` |
| `ORBIT` | `RUN`, `INIT` |
| `RUN` | `ORBIT` |
| `ERROR` | `NEW`, `INIT` |

> UI controls (transition buttons in `SatelliteInspector`, global buttons in `ControlPanel`) are generated from this table, so only legal transitions are offered.

---

## Normal lifecycle

```
NEW  ──INIT──▶  INIT  ──ORBIT──▶  ORBIT  ──RUN──▶  RUN
 ▲                │                 │
 │                └────NEW──────────┘
 │                        ▼
 └──────────────────────(any state)
```

Typical operator sequence for starting a run:

1. All nodes start in `NEW`.
2. Operator clicks **INIT** in `ControlPanel` → `transitionAll('INIT')`.
3. Operator clicks **ORBIT** → `transitionAll('ORBIT')`.
4. Operator starts recording and clicks **RUN** → `transitionAll('RUN')`.
5. At end of run, operator clicks **ORBIT** → `transitionAll('ORBIT')`.

---

## Error handling

### How errors occur

- **Simulated fault injection** — when the cluster is transitioned to `INIT`, each `EudaqNativeWriter` satellite has a ~15 % chance of immediately entering `ERROR` instead. This simulates a misconfiguration (invalid `_data.receive_from` value).
- **Manual** — an operator can use `SatelliteInspector` to force any satellite to `ERROR` if it is in the transition list.

### Error state behaviour

- The satellite is excluded from `transitionAll` commands unless the target is `NEW` or `INIT`.
- An **Active Faults** sidebar panel appears in the footer showing all `ERROR` satellites.
- The `Cluster Health` indicator in the header switches to `N FAULT(S)` with a pulsing warning icon.
- An `!! ACTION REQUIRED` badge appears in the `SatelliteTable` header.

### Recovery

An operator can recover a faulted satellite in two ways:

| Method | Action | Result |
|---|---|---|
| **ACK / RESET button** (Active Faults sidebar) | Calls `resetSatellite(id)` | State → `NEW`, `errors` cleared, `msg` set to `'Manual reset via ACK'` |
| **Manual transition** (SatelliteInspector) | Calls `transitionSingle(id, 'NEW')` or `transitionSingle(id, 'INIT')` | State changed accordingly; `errors` cleared if target is `NEW` |

---

## Global vs individual transitions

| Function | Scope | Error satellites |
|---|---|---|
| `transitionAll(targetState)` | All satellites | Skipped unless target is `NEW` or `INIT` |
| `transitionSingle(id, targetState)` | One satellite | Always applied if target is in `STATES[current].transitions` |

---

## `globalMetrics.state` computation

The header FSM strip and `ControlPanel` reflect a single constellation-level state, computed as:

1. Collect all non-`ERROR` satellites.
2. Find the satellite with the **lowest FSM rank** among them.
3. If all satellites are `ERROR`, report `ERROR`.
4. Set `isMixed = true` if non-error satellites are not all in the same state.

This means the strip reflects the "bottleneck" node — the operator must address that node before the cluster can progress.

---

## State colours reference

Defined in `src/constants.js` as the `STATES` object. Each state entry contains:

```js
{
  name:        string,   // state key
  color:       string,   // Tailwind text colour class
  bg:          string,   // Tailwind background colour class (for pills)
  dot:         string,   // Tailwind background class for the status dot
  rank:        number,   // numeric ordering used for sort and globalMetrics
  transitions: string[], // allowed target states
}
```
