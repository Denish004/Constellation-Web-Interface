import { Zap, RefreshCw, Download } from 'lucide-react';
import { DEFAULT_CONFIG } from '../constants.js';

export default function ConfigTab({ configText, setConfigText, deduceConfig, addLog }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        <textarea
          value={configText}
          onChange={e => setConfigText(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-black/50 border border-slate-800 rounded p-2 text-[10px] text-emerald-300/80 font-mono resize-none focus:outline-none focus:border-blue-500 leading-relaxed"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={deduceConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 rounded text-[10px] font-bold"
          >
            <Zap className="w-3 h-3" /> Deduce from Constellation
          </button>
          <button
            onClick={() => setConfigText(DEFAULT_CONFIG)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Default
          </button>
          <button
            onClick={() => addLog('INFO', 'MissionControl', 'Configuration applied to cluster', 'CMD')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/30 rounded text-[10px] font-bold"
          >
            <Download className="w-3 h-3" /> Apply Config
          </button>
        </div>
      </div>
    </div>
  );
}
