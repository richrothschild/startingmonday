// Epic E2 T2.6: Label metrics dashboard panels
// Shows: label coverage (% companies with >= 1 labeled outcome),
// label latency (median days from signal to label),
// role openings by source/family/sector breakdown.

'use client'

import { useEffect, useState } from 'react'

interface LabelStats {
  totalCompanies: number
  companiesWithLabels: number
  coveragePercent: number
  medianDaysToOpening: number | null
  openingsBySource: Array<{ source: string; count: number }>
  openingsByFamily: Array<{ family: string; count: number }>
  openingsBySector: Array<{ sector: string; count: number }>
  lastUpdated: string
}

interface SourceBreakdown {
  source_key: string
  total_openings: number
  median_days_to_opening: number | null
  hit_rate: number
}

export function LabelMetricsPanel() {
  const [stats, setStats] = useState<LabelStats | null>(null)
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/intelligence/label-metrics')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setStats(data.stats)
        setSourceBreakdown(data.sourceBreakdown || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('label-metrics: fetch failed', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-slate-200 rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-medium">Error loading label metrics</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-slate-600">No label data available yet</div>
  }

  const coverageStatus = stats.coveragePercent >= 60 ? 'pass' : stats.coveragePercent >= 40 ? 'warn' : 'fail'
  const statusColor = {
    pass: 'text-green-700 bg-green-50',
    warn: 'text-yellow-700 bg-yellow-50',
    fail: 'text-red-700 bg-red-50',
  }[coverageStatus]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Label Coverage & Latency</h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {/* Coverage Card */}
      <div className={`p-6 rounded-lg border-2 ${statusColor}`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium opacity-75">Label Coverage</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stats.coveragePercent.toFixed(1)}%</span>
              <span className="text-lg opacity-75">({stats.companiesWithLabels} / {stats.totalCompanies})</span>
            </div>
            <p className="text-xs mt-2 opacity-75">Companies with {'\u2265'} 1 labeled outcome</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">
              {coverageStatus === 'pass' ? '✓ On Track' : coverageStatus === 'warn' ? '⚠ Monitor' : '✗ Backlog'}
            </p>
            <p className="text-xs mt-1 opacity-75">Target: {'\u2265'} 60%</p>
          </div>
        </div>
      </div>

      {/* Latency Card */}
      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-700">Median Label Latency</p>
        <div className="mt-2 flex items-baseline gap-2">
          {stats.medianDaysToOpening !== null ? (
            <>
              <span className="text-4xl font-bold text-blue-900">{stats.medianDaysToOpening.toFixed(0)}</span>
              <span className="text-lg text-blue-700">days before opening</span>
            </>
          ) : (
            <span className="text-lg text-blue-700 italic">No labeled outcomes yet</span>
          )}
        </div>
        <p className="text-xs mt-2 text-blue-700">Signal-to-label detection latency (precursor quality)</p>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* By Source */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">By Source</h3>
          <div className="space-y-2">
            {stats.openingsBySource.length > 0 ? (
              stats.openingsBySource.map((row) => (
                <div key={row.source} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{row.source}</span>
                  <span className="font-mono bg-slate-200 px-2 py-1 rounded text-slate-900">{row.count}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-sm italic">No data</p>
            )}
          </div>
        </div>

        {/* By Role Family */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">By Role Family</h3>
          <div className="space-y-2">
            {stats.openingsByFamily.length > 0 ? (
              stats.openingsByFamily.map((row) => (
                <div key={row.family} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{row.family}</span>
                  <span className="font-mono bg-slate-200 px-2 py-1 rounded text-slate-900">{row.count}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-sm italic">No data</p>
            )}
          </div>
        </div>

        {/* By Sector */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">By Sector (Top 5)</h3>
          <div className="space-y-2">
            {stats.openingsBySector.slice(0, 5).length > 0 ? (
              stats.openingsBySector.slice(0, 5).map((row) => (
                <div key={row.sector} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 truncate">{row.sector}</span>
                  <span className="font-mono bg-slate-200 px-2 py-1 rounded text-slate-900">{row.count}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-sm italic">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Source Details Table */}
      {sourceBreakdown.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Source Details (Last 24h)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-300">
                <tr>
                  <th className="text-left py-2 px-2 text-slate-700">Source</th>
                  <th className="text-right py-2 px-2 text-slate-700">Openings</th>
                  <th className="text-right py-2 px-2 text-slate-700">Hit Rate</th>
                  <th className="text-right py-2 px-2 text-slate-700">Median Days</th>
                </tr>
              </thead>
              <tbody>
                {sourceBreakdown.map((row) => (
                  <tr key={row.source_key} className="border-b border-slate-200 hover:bg-slate-100">
                    <td className="py-2 px-2 text-slate-700">{row.source_key}</td>
                    <td className="py-2 px-2 text-right text-slate-900 font-mono">{row.total_openings}</td>
                    <td className="py-2 px-2 text-right text-slate-900 font-mono">
                      {(row.hit_rate * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right text-slate-900 font-mono">
                      {row.median_days_to_opening !== null ? row.median_days_to_opening.toFixed(0) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-slate-600 pt-2">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}
