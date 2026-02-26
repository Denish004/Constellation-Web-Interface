import { Layers } from 'lucide-react';
import { STATES } from '../constants.js';

export default function SatelliteTable({ sortedSatellites, selectedSatId, setSelectedSatId, globalMetrics }) {
  return (
    <section className="flex-1 flex flex-col min-w-0">
      <div className="px-4 py-1.5 flex justify-between items-center bg-slate-900/60 border-b border-slate-800 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-3 h-3" /> Satellite Registry
          {globalMetrics.errors > 0 && (
            <span className="text-red-400 animate-pulse bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20 text-[9px]">
              !! ACTION REQUIRED
            </span>
          )}
        </span>
        <span className="text-[9px] text-slate-600">{sortedSatellites.length} nodes connected</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0f1629] z-10 shadow-md">
            <tr className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800">
              <th className="px-4 py-2 w-52">Canonical Name</th>
              <th className="px-4 py-2 w-28">FSM State</th>
              <th className="px-4 py-2 w-32">Heartbeat</th>
              <th className="px-4 py-2 w-20 text-center">Faults</th>
              <th className="px-4 py-2 w-24 text-right tabular-nums">Events</th>
              <th className="px-4 py-2">Last Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sortedSatellites.map(sat => (
              <tr
                key={sat.id}
                onClick={() => setSelectedSatId(sat.id === selectedSatId ? null : sat.id)}
                className={`cursor-pointer transition-colors ${
                  selectedSatId === sat.id
                    ? 'bg-blue-500/10 border-l-2 border-blue-500'
                    : sat.state === 'ERROR'
                    ? 'bg-red-500/5 hover:bg-red-500/10'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATES[sat.state].dot}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-100 text-[11px]">{sat.name}</span>
                      <span className="text-[9px] text-slate-600 uppercase">{sat.type}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${STATES[sat.state].color} ${STATES[sat.state].bg}`}>
                    {sat.state}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${Date.now() - sat.heartbeat < 5000 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-[10px] text-slate-500 tabular-nums">
                      {((Date.now() - sat.heartbeat) / 1000).toFixed(1)}s ago
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-2.5 text-center font-bold text-[11px] ${sat.errors > 0 ? 'text-red-400' : 'text-slate-700'}`}>
                  {sat.errors || '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-[10px] text-slate-500 tabular-nums">
                  {sat.events > 0 ? sat.events.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-slate-400 italic font-sans truncate max-w-xs">
                  {sat.msg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
