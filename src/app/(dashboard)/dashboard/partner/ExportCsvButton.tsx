"use client"
import { exportToCsv } from '@/components/export-csv'
export function ExportCsvButton({ rows }: { rows: any[] }) {
  return (
    <div className="mb-4">
      <button
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-sm"
        onClick={() => exportToCsv('partner-attributions.csv', rows)}
        disabled={!rows.length}
      >
        Export Attributions CSV
      </button>
    </div>
  )
}