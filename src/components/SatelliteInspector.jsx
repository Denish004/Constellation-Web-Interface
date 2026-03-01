import { Cpu, X, ArrowRight, RefreshCw, History } from 'lucide-react';
import { STATES } from '../constants.js';
import { levelColor } from '../constants.js';

export default function SatelliteInspector({ selectedSat, setSelectedSatId, transitionSingle, resetSatellite, addLog }) {
  if (!selectedSat) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-700 text-[11px] italic">
        Click a satellite to inspect
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between bg-black/20 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-slate-100 text-[11px] uppercase">Inspector</span>
        </div>
        <button onClick={() => setSelectedSatId(null)} className="p-0.5 hover:bg-slate-700 rounded text-slate-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-4 flex-1">
        {/* Identity */}
        <div className="bg-black/30 rounded border border-slate-800 p-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="text-blue-300 font-bold">{selectedSat.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className="text-slate-400">{selectedSat.type}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-1">
            <span className="text-slate-500">State</span>
            <span className={`font-bold ${STATES[selectedSat.state].color}`}>{selectedSat.state}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Events</span>
            <span className="text-slate-300 tabular-nums">{selectedSat.events.toLocaleString()}</span>
          </div>
        </div>

        {/* FSM Transitions */}
        <div>
          <h4 className="text-[9px] text-slate-500 font-bold uppercase mb-1.5 flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> Valid Transitions
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {STATES[selectedSat.state].transitions.map(t => (
              <button
                key={t}
                onClick={() => transitionSingle(selectedSat.id, t)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-all hover:brightness-125 ${STATES[t].color} ${STATES[t].bg} ${STATES[t].color.replace('text', 'border')}/30`}
              >
                → {t}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Overrides */}
        <div className="flex gap-2">
          <button
            onClick={() => resetSatellite(selectedSat.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold"
          >
            <RefreshCw className="w-3 h-3" /> RESET
          </button>
          <button
            onClick={() => { transitionSingle(selectedSat.id, 'ERROR'); addLog('CRITICAL', selectedSat.name, 'Manually forced into ERROR state', 'CMD'); }}
            className="flex-1 py-1.5 bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/40 rounded text-[10px] font-bold"
          >
            FORCE ERROR
          </button>
        </div>

        {/* Local Trace */}
        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="text-[9px] text-slate-500 font-bold uppercase mb-1.5 flex items-center gap-1">
            <History className="w-3 h-3" /> Local Trace
          </h4>
          <div className="flex-1 min-h-16 max-h-48 bg-black/40 rounded border border-slate-800 overflow-y-auto p-2 space-y-1">
            {selectedSat.logs.map(l => (
              <div key={l.id} className="text-[10px] border-b border-slate-900/50 pb-0.5">
                <span className="text-slate-700 mr-1">[{l.timestamp}]</span>
                <span className={levelColor(l.level)}>{l.message}</span>
              </div>
            ))}
            {selectedSat.logs.length === 0 && (
              <span className="text-slate-700 italic text-[10px]">No trace events.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
