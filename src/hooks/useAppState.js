import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { STATES, INITIAL_SATELLITES, DEFAULT_CONFIG } from '../constants.js';

export function useAppState() {
  const [satellites, setSatellites]     = useState(INITIAL_SATELLITES);
  const [logs, setLogs]                 = useState([]);
  const [selectedSatId, setSelectedSatId] = useState(null);
  const [runId, setRunId]               = useState(42);
  const [runName, setRunName]           = useState('cosmic_ray');
  const [isRecording, setIsRecording]   = useState(false);
  const [startTime, setStartTime]       = useState(null);
  const [elapsed, setElapsed]           = useState('00:00:00');
  const [currentTime, setCurrentTime]   = useState('');
  const [footerTab, setFooterTab]       = useState('observatory');
  const [logFilter, setLogFilter]       = useState({ level: 'ALL', sender: 'ALL', topic: 'ALL', text: '' });
  const [configText, setConfigText]     = useState(DEFAULT_CONFIG);
  const [chartData, setChartData]       = useState(
    Array.from({ length: 30 }, (_, i) => ({
      t: i - 29,
      ...Object.fromEntries(INITIAL_SATELLITES.map(s => [s.id, 0])),
    }))
  );

  const logsRef = useRef(logs);
  logsRef.current = logs;

  // ── Derived ────────────────────────────────────────────────────────────────
  const globalMetrics = useMemo(() => {
    const errorCount = satellites.filter(s => s.state === 'ERROR').length;
    const nonError   = satellites.filter(s => s.state !== 'ERROR');
    const isMixed    = nonError.length > 0 && !nonError.every(s => s.state === nonError[0]?.state);
    let lowest = 'NEW';
    let minRank = 99;
    satellites.forEach(s => {
      if (STATES[s.state].rank < minRank && s.state !== 'ERROR') {
        minRank = STATES[s.state].rank;
        lowest = s.state;
      }
    });
    if (errorCount > 0 && nonError.length === 0) lowest = 'ERROR';
    if (errorCount > 0 && nonError.length > 0 && minRank === 99) lowest = 'NEW';
    return { state: lowest, errors: errorCount, total: satellites.length, isMixed };
  }, [satellites]);

  const selectedSat = useMemo(
    () => satellites.find(s => s.id === selectedSatId),
    [satellites, selectedSatId]
  );

  const sortedSatellites = useMemo(() => {
    return [...satellites].sort((a, b) => {
      if (a.state === 'ERROR' && b.state !== 'ERROR') return -1;
      if (b.state === 'ERROR' && a.state !== 'ERROR') return 1;
      return STATES[b.state].rank - STATES[a.state].rank;
    });
  }, [satellites]);

  const filteredLogs = useMemo(() => logs.filter(l => {
    if (logFilter.level  !== 'ALL' && l.level  !== logFilter.level)  return false;
    if (logFilter.sender !== 'ALL' && l.sender !== logFilter.sender)  return false;
    if (logFilter.topic  !== 'ALL' && l.topic  !== logFilter.topic)   return false;
    if (logFilter.text && !l.message.toLowerCase().includes(logFilter.text.toLowerCase()) &&
        !l.sender.toLowerCase().includes(logFilter.text.toLowerCase())) return false;
    return true;
  }), [logs, logFilter]);

  const uniqueSenders = useMemo(() => ['ALL', ...new Set(logs.map(l => l.sender))], [logs]);

  const runIdentifier = `${runName || 'run'}_${String(runId).padStart(4, '0')}`;

  // ── Actions ────────────────────────────────────────────────────────────────
  const addLog = useCallback((level, sender, message, topic = 'FSM') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const newLog = { id: Math.random().toString(36).substr(2, 9), timestamp, level, sender, message, topic };
    setLogs(prev => [newLog, ...prev].slice(0, 200));
    setSatellites(prev => prev.map(s =>
      s.name === sender ? { ...s, logs: [newLog, ...s.logs].slice(0, 30) } : s
    ));
  }, []);

  const transitionAll = useCallback((targetState) => {
    setSatellites(prev => prev.map(s => {
      if (s.state === 'ERROR' && targetState !== 'NEW' && targetState !== 'INIT') return s;
      if (s.type === 'EudaqNativeWriter' && targetState === 'INIT' && Math.random() > 0.85) {
        const errorMsg = 'Critical failure: Value of key _data.receive_from is not valid: Sender is not a valid canonical name';
        setTimeout(() => addLog('CRITICAL', s.name, errorMsg, 'FSM'), 0);
        return { ...s, state: 'ERROR', msg: errorMsg, errors: s.errors + 1 };
      }
      setTimeout(() => addLog('STATUS', s.name, `FSM → ${targetState}`, 'FSM'), 0);
      return { ...s, state: targetState, heartbeat: Date.now(), msg: `Transitioned to ${targetState}` };
    }));
    addLog('STATUS', 'MissionControl', `Cluster broadcast: → ${targetState}`, 'CMD');
  }, [addLog]);

  const transitionSingle = useCallback((id, targetState) => {
    setSatellites(prev => prev.map(s => {
      if (s.id !== id) return s;
      setTimeout(() => addLog('STATUS', s.name, `Manual FSM → ${targetState}`, 'CMD'), 0);
      return { ...s, state: targetState, heartbeat: Date.now(), msg: `Manual → ${targetState}`, errors: targetState === 'NEW' ? 0 : s.errors };
    }));
  }, [addLog]);

  const resetSatellite = useCallback((id) => {
    setSatellites(prev => prev.map(s =>
      s.id === id ? { ...s, state: 'NEW', errors: 0, msg: 'Manual reset via ACK' } : s
    ));
    addLog('WARNING', 'MissionControl', `Manual FSM reset on id=${id}`, 'CMD');
  }, [addLog]);

  const deduceConfig = useCallback(() => {
    const lines = ['[_default]\n'];
    satellites.forEach(s => {
      lines.push(`[${s.name.toLowerCase()}]`);
      lines.push(`  # state = ${s.state}`);
      lines.push(`  # faults = ${s.errors}`);
      if (s.type === 'EudaqNativeWriter') lines.push(`  _data.receive_from = ['RandomTransmitter.Sender']`);
      if (s.type === 'Sputnik') lines.push(`  interval = 3000`);
      lines.push('');
    });
    setConfigText(lines.join('\n'));
    addLog('INFO', 'MissionControl', 'Configuration deduced from live Constellation state', 'CMD');
  }, [satellites, addLog]);

  // ── Clock, heartbeat & chart tick ─────────────────────────────────────────
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));

      if (isRecording && startTime) {
        const diff = Date.now() - startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setElapsed(`${h}:${m}:${s}`);
      }

      setSatellites(prev => {
        const next = prev.map(s =>
          s.state === 'RUN'
            ? { ...s, heartbeat: Date.now(), _delta: Math.floor(Math.random() * 480 + 20), events: s.events + Math.floor(Math.random() * 480 + 20) }
            : s.state !== 'ERROR'
            ? { ...s, heartbeat: Math.random() > 0.03 ? Date.now() : s.heartbeat, _delta: 0 }
            : { ...s, _delta: 0 }
        );
        setChartData(prev => {
          const point = { t: (prev[prev.length - 1]?.t ?? 0) + 1 };
          next.forEach(s => { point[s.id] = s._delta ?? 0; });
          return [...prev.slice(-59), point];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, startTime]);

  return {
    // state
    satellites, selectedSatId, setSelectedSatId,
    runId, setRunId, runName, setRunName,
    isRecording, setIsRecording,
    startTime, setStartTime,
    elapsed, setElapsed,
    currentTime,
    footerTab, setFooterTab,
    logFilter, setLogFilter,
    configText, setConfigText,
    chartData,
    logs, setLogs,
    // derived
    globalMetrics, selectedSat, sortedSatellites,
    filteredLogs, uniqueSenders, runIdentifier,
    // actions
    addLog, transitionAll, transitionSingle, resetSatellite, deduceConfig,
  };
}
