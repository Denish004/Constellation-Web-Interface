import { Filter, Search, X } from 'lucide-react';
import FilterSelect from './FilterSelect.jsx';
import { LOG_LEVELS, LOG_TOPICS, levelColor } from '../constants.js';

export default function Observatory({ logs, setLogs, filteredLogs, logFilter, setLogFilter, uniqueSenders }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-slate-800 bg-black/20 shrink-0 flex-wrap">
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-600" />
          {LOG_LEVELS.map(lv => (
            <button
              key={lv}
              onClick={() => setLogFilter(f => ({ ...f, level: lv }))}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                logFilter.level === lv
                  ? lv === 'ALL'      ? 'bg-slate-600 text-white'
                  : lv === 'CRITICAL' ? 'bg-red-500/30 text-red-300'
                  : lv === 'WARNING'  ? 'bg-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/30 text-emerald-300'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>

        <FilterSelect
          value={logFilter.sender}
          options={uniqueSenders}
          onChange={val => setLogFilter(f => ({ ...f, sender: val }))}
        />

        <FilterSelect
          value={logFilter.topic}
          options={LOG_TOPICS}
          onChange={val => setLogFilter(f => ({ ...f, topic: val }))}
        />

        <div className="flex items-center gap-1 bg-black/30 border border-slate-700 rounded px-2 py-0.5 flex-1 min-w-24">
          <Search className="w-3 h-3 text-slate-600 shrink-0" />
          <input
            value={logFilter.text}
            onChange={e => setLogFilter(f => ({ ...f, text: e.target.value }))}
            placeholder="Filter messages..."
            className="bg-transparent text-[10px] text-slate-300 placeholder-slate-700 focus:outline-none w-full"
          />
          {logFilter.text && (
            <button onClick={() => setLogFilter(f => ({ ...f, text: '' }))}>
              <X className="w-3 h-3 text-slate-600 hover:text-slate-400" />
            </button>
          )}
        </div>

        <button
          onClick={() => setLogFilter({ level: 'ALL', sender: 'ALL', topic: 'ALL', text: '' })}
          className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase border border-slate-800 px-2 py-0.5 rounded shrink-0"
        >
          Reset
        </button>

        <span className="text-[9px] text-slate-700 shrink-0">{filteredLogs.length} / {logs.length}</span>
      </div>

      {/* Log rows */}
      <div className="flex-1 overflow-y-auto p-2 space-y-px font-mono text-[10px]">
        {filteredLogs.map(log => (
          <div key={log.id} className="flex gap-3 hover:bg-slate-800/30 px-1 py-0.5 rounded">
            <span className="text-slate-700 shrink-0 w-16 tabular-nums">{log.timestamp}</span>
            <span className={`shrink-0 w-16 font-bold ${levelColor(log.level)}`}>{log.level}</span>
            <span className="text-slate-600 shrink-0 w-12 text-[9px] flex items-center">{log.topic}</span>
            <span className="text-blue-400/80 shrink-0 w-40 truncate">[{log.sender}]</span>
            <span className="text-slate-400 font-sans">{log.message}</span>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-slate-700 italic text-center mt-4">
            {logs.length === 0 ? 'Awaiting telemetry…' : 'No messages match current filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
