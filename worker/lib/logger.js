// Structured JSON logger — Railway's log dashboard parses JSON lines automatically.
function write(level, message, data = {}) {
  console.log(JSON.stringify({
    level,
    message,
    ts: new Date().toISOString(),
    ...data,
  }))
}

export const logger = {
  info:  (msg, data) => write('info',  msg, data),
  warn:  (msg, data) => write('warn',  msg, data),
  error: (msg, data) => write('error', msg, data),
}
