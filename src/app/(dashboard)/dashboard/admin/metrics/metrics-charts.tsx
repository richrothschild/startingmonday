'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { GROUP_COLORS, GROUP_LABELS, type ScoreGroup } from '@/lib/action-scores'

export type WeekRow = {
  week: string
  onboarding: number
  pipeline: number
  intelligence: number
  signals: number
  communication: number
  profile: number
}

export type EventDetail = {
  event_name: string
  label: string
  count30d: number
  count7d: number
  emotion: number
  cognitive_load: number
  retention: number
  composite: number
}

const GROUPS: ScoreGroup[] = [
  'onboarding', 'pipeline', 'intelligence', 'signals', 'communication', 'profile',
]

function ScoreBadge({ value, highGood }: { value: number; highGood: boolean }) {
  const good = highGood ? value >= 8 : value <= 3
  const mid  = highGood ? value >= 5 : value <= 6
  return (
    <span className={`font-bold ${good ? 'text-green-600' : mid ? 'text-amber-600' : 'text-red-500'}`}>
      {value}
    </span>
  )
}

export function MetricsCharts({
  weeklyData,
  groupDetails,
}: {
  weeklyData: WeekRow[]
  groupDetails: Record<string, EventDetail[]>
}) {
  const [selected, setSelected] = useState<ScoreGroup | null>(null)

  const details = selected ? (groupDetails[selected] ?? []) : []

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e2e8f0' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {GROUPS.map(g => (
            <Line
              key={g}
              type="monotone"
              dataKey={g}
              name={GROUP_LABELS[g]}
              stroke={GROUP_COLORS[g]}
              strokeWidth={selected === null || selected === g ? 2 : 0.5}
              strokeOpacity={selected === null || selected === g ? 1 : 0.25}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-2 mt-4 mb-5">
        <button
          onClick={() => setSelected(null)}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            selected === null
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          All groups
        </button>
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setSelected(selected === g ? null : g)}
            style={selected === g ? { borderColor: GROUP_COLORS[g], color: GROUP_COLORS[g] } : undefined}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              selected === g
                ? 'bg-white'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {GROUP_LABELS[g]}
          </button>
        ))}
      </div>

      {selected && (
        <div className="border-t border-slate-100 pt-5">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-3" style={{ color: GROUP_COLORS[selected] }}>
            {GROUP_LABELS[selected]} — event breakdown
          </p>
          {details.length === 0 ? (
            <p className="text-[13px] text-slate-400">No events recorded for this group yet.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-2 font-semibold text-slate-400">Action</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">30d</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">7d</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">Emotion</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">Cog load</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">Retention</th>
                  <th className="pb-2 font-semibold text-slate-400 text-right">Composite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...details].sort((a, b) => b.composite - a.composite).map(row => (
                  <tr key={row.event_name} className={row.count30d === 0 ? 'opacity-40' : ''}>
                    <td className="py-2.5 text-slate-700 font-medium">{row.label}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">{row.count30d}</td>
                    <td className="py-2.5 text-right text-slate-400">{row.count7d}</td>
                    <td className="py-2.5 text-right"><ScoreBadge value={row.emotion} highGood /></td>
                    <td className="py-2.5 text-right"><ScoreBadge value={row.cognitive_load} highGood={false} /></td>
                    <td className="py-2.5 text-right"><ScoreBadge value={row.retention} highGood /></td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{row.composite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
