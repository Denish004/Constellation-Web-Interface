import { BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { INITIAL_SATELLITES, SAT_COLORS } from '../constants.js';

export default function EventRateChart({ chartData, isRecording }) {
  return (
    <div className="border-b border-slate-800 p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
          <BarChart2 className="w-3 h-3" /> Event Rate · ev/s
        </span>
        {isRecording && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      </div>

      {!isRecording && (
        <div className="h-[100px] flex items-center justify-center text-[10px] text-slate-700 italic">
          Awaiting run start…
        </div>
      )}

      {isRecording && (
        <>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
              <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, fontSize: 10 }}
                labelFormatter={() => ''}
                formatter={(v, name) => [v, INITIAL_SATELLITES.find(s => s.id === name)?.name.split('.')[1] ?? name]}
              />
              {INITIAL_SATELLITES.map((s, idx) => (
                <Area
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={SAT_COLORS[idx]}
                  fill={SAT_COLORS[idx] + '18'}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {INITIAL_SATELLITES.map((s, idx) => (
              <span key={s.id} className="text-[9px] flex items-center gap-1">
                <span className="w-2 h-0.5 rounded-full inline-block" style={{ background: SAT_COLORS[idx] }} />
                <span className="text-slate-600">{s.name.split('.')[1]}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
