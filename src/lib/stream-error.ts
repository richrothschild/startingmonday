// Formats a caught error into the __ERROR__ prefix string that streaming
// clients parse to display error messages instead of blank output.
export function streamErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Unknown error'
  return `__ERROR__${msg}`
}
