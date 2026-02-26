import React from 'react';
import { Activity, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { STATES } from '../constants.js';

export default function Header({
  globalMetrics, runName, setRunName, isRecording,
  runId, elapsed, currentTime, runIdentifier,
}) {
  return (
    <header className="h-12 bg-[#0f1629] border-b border-slate-800 flex items-center px-4 gap-6 shrink-0 z-30 shadow-xl">

      {/* Logo */}
      <div className="flex items-center gap-2 pr-5 border-r border-slate-700/50 shrink-0">
        <Activity className="w-4 h-4 text-blue-500" />
        <span className="font-bold text-slate-100 tracking-tight text-sm uppercase">
          Constellation <span className="text-slate-500 font-normal ml-1 italic text-xs">MissionControl</span>
        </span>
      </div>

      {/* FSM Lifecycle Strip */}
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-md border border-slate-800 shrink-0">
        {['NEW', 'INIT', 'ORBIT', 'RUN'].map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
              globalMetrics.state === s
                ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                : 'text-slate-600'
            }`}>
              {s}
            </div>
            {idx < 3 && <ChevronRight className="w-3 h-3 text-slate-800" />}
          </React.Fragment>
        ))}
        {globalMetrics.isMixed && (
          <span
            className="ml-1 text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1 rounded border border-amber-400/20"
            title="Satellites are in mixed states"
          >≊</span>
        )}
      </div>

      {/* Run ID */}
      <div className="flex items-center gap-2 border-l border-slate-700/50 pl-5 shrink-0">
        <span className="text-[9px] text-slate-500 font-bold uppercase">Run ID</span>
        <input
          value={runName}
          onChange={e => setRunName(e.target.value.replace(/\s+/g, '_'))}
          disabled={isRecording}
          className="bg-black/30 border border-slate-700 rounded px-2 py-0.5 text-blue-300 font-bold w-28 text-[11px] focus:outline-none focus:border-blue-500 disabled:opacity-50"
          placeholder="run_name"
        />
        <span className="text-slate-600">_</span>
        <span className="text-blue-400 font-bold tabular-nums text-[11px]">{String(runId).padStart(4, '0')}</span>
      </div>

      {/* Timer */}
      <div className="flex flex-col border-l border-slate-700/50 pl-5 shrink-0">
        <span className="text-[9px] text-slate-500 font-bold uppercase">Duration</span>
        <span className={`font-bold tabular-nums ${isRecording ? 'text-emerald-400' : 'text-slate-600'}`}>{elapsed}</span>
      </div>

      {/* Health */}
      <div className="flex flex-col border-l border-slate-700/50 pl-5 shrink-0">
        <span className="text-[9px] text-slate-500 font-bold uppercase">Cluster Health</span>
        <div className="flex items-center gap-1.5">
          <span className={globalMetrics.errors > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {globalMetrics.errors > 0 ? `${globalMetrics.errors} FAULT${globalMetrics.errors > 1 ? 'S' : ''}` : 'NOMINAL'}
          </span>
          {globalMetrics.errors > 0 && <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />}
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 border-l border-slate-700/50 pl-5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold text-[11px] uppercase">Recording</span>
          <span className="text-slate-500 text-[10px]">{runIdentifier}</span>
        </div>
      )}

      {/* Clock */}
      <div className="ml-auto flex items-center gap-1.5 text-slate-500 text-[10px] shrink-0">
        <Clock className="w-3 h-3" />
        <span className="tabular-nums">{currentTime}</span>
      </div>
    </header>
  );
}
