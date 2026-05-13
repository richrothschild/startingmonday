export type TraceRef = {
  id: string
}

export function resolveNextActiveRowId(
  visibleTraces: readonly TraceRef[],
  removedTraceId: string,
  currentActiveRowId: string | null,
): string | null {
  if (currentActiveRowId !== removedTraceId) return currentActiveRowId

  const currentIndex = visibleTraces.findIndex((trace) => trace.id === removedTraceId)
  const nextVisible = visibleTraces.filter((trace) => trace.id !== removedTraceId)

  if (nextVisible.length === 0) return null
  if (currentIndex < 0) return nextVisible[0].id
  if (currentIndex < nextVisible.length) return nextVisible[currentIndex].id

  return nextVisible[nextVisible.length - 1].id
}