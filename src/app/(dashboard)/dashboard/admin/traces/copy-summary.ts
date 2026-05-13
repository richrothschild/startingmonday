export type SummaryRow = readonly [string, number]

export type CopyFormat = 'list' | 'table'

export function buildFailureSummaryPayload(
  rowsForCopy: SummaryRow[],
  options: {
    modeLabel: string
    includeZeroCounts: boolean
    trimForSlack: boolean
    copyFormat: CopyFormat
    topFailureTheme: SummaryRow | null
  }
): string {
  const rowsForCopySlack = options.trimForSlack ? rowsForCopy.slice(0, 6) : rowsForCopy
  const rowsOmittedForSlack = Math.max(0, rowsForCopy.length - rowsForCopySlack.length)

  if (options.copyFormat === 'table') {
    const header = `Failure tags (${options.modeLabel}${options.includeZeroCounts ? ', includes zeros' : ''}${options.trimForSlack ? ', trimmed for Slack' : ''})`
    const tableLines = [
      '| Tag | Count |',
      '| --- | ---: |',
      ...rowsForCopySlack.map(([tag, count]) => `| ${tag} | ${count} |`),
    ]
    let payload = [header, '', ...tableLines].join('\n')
    if (rowsOmittedForSlack > 0) {
      payload += `\n\n(${rowsOmittedForSlack} additional tag${rowsOmittedForSlack === 1 ? '' : 's'} omitted)`
    }
    if (options.topFailureTheme) {
      payload += `\n\nTop theme: **${options.topFailureTheme[0]}** (${options.topFailureTheme[1]})`
    }
    return payload
  }

  const lines = [
    `Failure tags (${options.modeLabel}${options.includeZeroCounts ? ', includes zeros' : ''}${options.trimForSlack ? ', trimmed for Slack' : ''})`,
    ...rowsForCopySlack.map(([tag, count]) => `- ${tag}: ${count}`),
  ]
  if (rowsOmittedForSlack > 0) {
    lines.push(`(${rowsOmittedForSlack} additional tag${rowsOmittedForSlack === 1 ? '' : 's'} omitted)`)
  }

  if (options.topFailureTheme) {
    lines.push(`Top theme: ${options.topFailureTheme[0]} (${options.topFailureTheme[1]})`)
  }
  return lines.join('\n')
}
