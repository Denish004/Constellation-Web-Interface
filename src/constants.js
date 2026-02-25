export const STATES = {
  NEW:   { name: 'NEW',   color: 'text-slate-400',   bg: 'bg-slate-400/10',   dot: 'bg-slate-400',   rank: 0,  transitions: ['INIT'] },
  INIT:  { name: 'INIT',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    dot: 'bg-blue-400',    rank: 1,  transitions: ['ORBIT', 'NEW'] },
  ORBIT: { name: 'ORBIT', color: 'text-purple-400',  bg: 'bg-purple-400/10',  dot: 'bg-purple-400',  rank: 2,  transitions: ['RUN', 'INIT'] },
  RUN:   { name: 'RUN',   color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400', rank: 3,  transitions: ['ORBIT'] },
  ERROR: { name: 'ERROR', color: 'text-red-500',     bg: 'bg-red-500/10',     dot: 'bg-red-500',     rank: -1, transitions: ['NEW', 'INIT'] },
};

export const SAT_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#f87171', '#38bdf8'];

export const INITIAL_SATELLITES = [
  { id: '1', type: 'Sputnik',           name: 'Sputnik.One',              state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
  { id: '2', type: 'Sputnik',           name: 'Sputnik.Two',              state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
  { id: '3', type: 'Sputnik',           name: 'Sputnik.Three',            state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
  { id: '4', type: 'RandomTransmitter', name: 'RandomTransmitter.Sender', state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
  { id: '5', type: 'EudaqNativeWriter', name: 'EudaqNativeWriter.Recv',   state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
  { id: '6', type: 'TluTransmitter',    name: 'TluTransmitter.Trigger',   state: 'NEW', heartbeat: Date.now(), msg: 'Idle', errors: 0, logs: [], events: 0 },
];

export const DEFAULT_CONFIG = `[Sputnik._default]
interval = 3000

[Sputnik.One]
interval = 2500

[Sputnik.Two]

[Sputnik.Three]

[RandomTransmitter.Sender]

[EudaqNativeWriter.Receiver]
_data.receive_from = ["RandomTransmitter.Sender"]
output_directory = "/tmp/test"
`;

export const LOG_LEVELS = ['ALL', 'STATUS', 'INFO', 'WARNING', 'CRITICAL'];
export const LOG_TOPICS = ['ALL', 'FSM', 'LINK', 'DATA', 'CMD'];

export const levelColor = (l) =>
  l === 'CRITICAL' ? 'text-red-400'
  : l === 'WARNING' ? 'text-amber-400'
  : l === 'STATUS'  ? 'text-emerald-400'
  : 'text-slate-400';
