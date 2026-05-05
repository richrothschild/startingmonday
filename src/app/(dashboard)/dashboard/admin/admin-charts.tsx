'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

type FunnelRow = { step: string; count: number; label: string }
type EventRow  = { event_name: string; count: number }

function shortLabel(step: string) {
  const MAP: Record<string, string> = {
    a1_resume: 'Resume', a2_company: 'Company', a3_prep: 'Brief',
    a4_contact: 'Contact', a5_briefing: 'Briefing', a6_follow_up: 'Follow-up',
  }
  return MAP[step] ?? step
}

export function FunnelChart({ data }: { data: FunnelRow[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e2e8f0' }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((row, i) => (
            <Cell key={i} fill={row.count / max > 0.5 ? '#0f172a' : '#cbd5e1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EventVolumeChart({ data }: { data: EventRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="event_name" width={160} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 4, border: '1px solid #e2e8f0' }}
          cursor={{ fill: '#f8fafc' }}
        />
        <Bar dataKey="count" fill="#0f172a" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
