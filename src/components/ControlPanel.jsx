import { Play, Square, Rocket, ChevronDown, Power, PlayCircle } from 'lucide-react';

export default function ControlPanel({
  globalMetrics,
  transitionAll,
  isRecording, setIsRecording,
  setStartTime, setRunId, setElapsed,
}) {
  return (
    <div className="w-56 border-r border-slate-800 flex flex-col bg-[#090e1c]">
      <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Control</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2 text-[11px]">

        <button
          onClick={() => transitionAll('INIT')}
          disabled={globalMetrics.state !== 'NEW' && globalMetrics.state !== 'ERROR'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-200">Initialize</span>
        </button>

        <button
          onClick={() => transitionAll('NEW')}
          disabled={globalMetrics.state === 'NEW'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <Power className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="font-semibold text-slate-200">Shutdown</span>
        </button>

        <button
          onClick={() => transitionAll('ORBIT')}
          disabled={globalMetrics.state !== 'INIT'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <Rocket className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">Launch</span>
        </button>

        <button
          onClick={() => transitionAll('INIT')}
          disabled={globalMetrics.state !== 'ORBIT'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <ChevronDown className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="font-semibold text-slate-200">Land</span>
        </button>

        <button
          onClick={() => { setIsRecording(true); setStartTime(Date.now()); transitionAll('RUN'); }}
          disabled={globalMetrics.state !== 'ORBIT'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200">Start</span>
        </button>

        <button
          onClick={() => { setIsRecording(false); setRunId(r => r + 1); setElapsed('00:00:00'); transitionAll('ORBIT'); }}
          disabled={globalMetrics.state !== 'RUN'}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 rounded-md transition-all"
        >
          <Square className="w-4 h-4 text-red-400 fill-red-400 shrink-0" />
          <span className="font-semibold text-slate-200">Stop</span>
        </button>

      </div>
    </div>
  );
}
