import { Terminal, FileText, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAppState } from './hooks/useAppState.js';
import Header from './components/Header.jsx';
import SatelliteTable from './components/SatelliteTable.jsx';
import EventRateChart from './components/EventRateChart.jsx';
import SatelliteInspector from './components/SatelliteInspector.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import Observatory from './components/Observatory.jsx';
import ConfigTab from './components/ConfigTab.jsx';

export default function App() {
  const state = useAppState();
  const {
    satellites, sortedSatellites, selectedSatId, setSelectedSatId, selectedSat,
    runId, setRunId, runName, setRunName,
    isRecording, setIsRecording, startTime, setStartTime,
    elapsed, setElapsed, currentTime,
    footerTab, setFooterTab,
    logFilter, setLogFilter,
    configText, setConfigText,
    chartData, logs, setLogs, filteredLogs, uniqueSenders,
    globalMetrics, runIdentifier,
    addLog, transitionAll, transitionSingle, resetSatellite, deduceConfig,
  } = state;

  return (
    <div className="flex flex-col h-screen bg-[#070d1a] text-slate-300 font-mono text-[12px] overflow-hidden selection:bg-blue-500/30">

      <Header
        globalMetrics={globalMetrics}
        runName={runName}
        setRunName={setRunName}
        isRecording={isRecording}
        runId={runId}
        elapsed={elapsed}
        currentTime={currentTime}
        runIdentifier={runIdentifier}
      />

      <main className="flex-1 flex overflow-hidden relative">
        <SatelliteTable
          sortedSatellites={sortedSatellites}
          selectedSatId={selectedSatId}
          setSelectedSatId={setSelectedSatId}
          globalMetrics={globalMetrics}
        />

        <aside className="w-80 flex flex-col border-l border-slate-800 bg-[#0b1120]">
          <EventRateChart chartData={chartData} isRecording={isRecording} />
          <SatelliteInspector
            selectedSat={selectedSat}
            setSelectedSatId={setSelectedSatId}
            transitionSingle={transitionSingle}
            resetSatellite={resetSatellite}
            addLog={addLog}
          />
        </aside>
      </main>

      <footer className="h-56 bg-[#0f1629] border-t border-slate-800 flex shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-30">
        <ControlPanel
          globalMetrics={globalMetrics}
          transitionAll={transitionAll}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          setStartTime={setStartTime}
          setRunId={setRunId}
          setElapsed={setElapsed}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/60 shrink-0">
            {[
              { id: 'observatory', label: 'Observatory', icon: Terminal },
              { id: 'config',      label: 'Configuration', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFooterTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
                  footerTab === id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
            {footerTab === 'observatory' && (
              <button onClick={() => setLogs([])} className="ml-auto mr-3 text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase">
                Clear
              </button>
            )}
          </div>

          {footerTab === 'observatory' && (
            <Observatory
              logs={logs}
              setLogs={setLogs}
              filteredLogs={filteredLogs}
              logFilter={logFilter}
              setLogFilter={setLogFilter}
              uniqueSenders={uniqueSenders}
            />
          )}
          {footerTab === 'config' && (
            <ConfigTab
              configText={configText}
              setConfigText={setConfigText}
              deduceConfig={deduceConfig}
              addLog={addLog}
            />
          )}
        </div>

        {/* Active Faults sidebar */}
        {globalMetrics.errors > 0 && (
          <div className="w-72 bg-red-950/20 border-l border-red-900/40 flex flex-col shrink-0">
            <div className="px-3 py-1.5 bg-red-900/20 border-b border-red-900/40 flex items-center gap-2 text-red-400 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Active Faults</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {satellites.filter(s => s.state === 'ERROR').map(s => (
                <div key={s.id} className="p-2 bg-red-900/10 border border-red-500/20 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-red-400 text-[11px]">{s.name}</span>
                    <button
                      onClick={() => resetSatellite(s.id)}
                      className="text-[9px] bg-red-500/20 hover:bg-red-500/40 px-2 py-0.5 rounded text-red-200 border border-red-500/30 font-bold"
                    >
                      ACK / RESET
                    </button>
                  </div>
                  <p className="text-[10px] text-red-300/80 leading-tight italic">{s.msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}