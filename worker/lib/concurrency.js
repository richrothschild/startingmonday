// Simple async concurrency limiter — runs at most `limit` promises at a time.
export function createLimiter(limit) {
  let active = 0
  const queue = []

  function next() {
    if (queue.length === 0 || active >= limit) return
    const { fn, resolve, reject } = queue.shift()
    active++
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--
        next()
      })
    next() // fill remaining slots
  }

  return function run(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject })
      next()
    })
  }
}
