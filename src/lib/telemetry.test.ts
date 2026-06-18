import { afterEach, describe, expect, it, vi } from 'vitest'
import { logQueueWorkerRun } from '@/lib/telemetry'

describe('logQueueWorkerRun', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('emits structured success telemetry on console.log', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1600)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    logQueueWorkerRun({
      queue: 'outreach_send_jobs',
      workerId: 'worker_1',
      event: 'queue_worker_run',
      startedAtMs: 1000,
      processed: 3,
      accepted: 2,
      failed: 1,
      retried: 0,
      metadata: { limit: 10 },
    })

    expect(logSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as Record<string, unknown>
    expect(payload.event).toBe('queue_worker_run')
    expect(payload.queue).toBe('outreach_send_jobs')
    expect(payload.worker_id).toBe('worker_1')
    expect(payload.processed).toBe(3)
    expect(payload.accepted).toBe(2)
    expect(payload.failed).toBe(1)
    expect(payload.retried).toBe(0)
    expect(payload.latency_ms).toBe(600)
    expect(payload.metadata).toEqual({ limit: 10 })
  })

  it('emits structured error telemetry on console.error', () => {
    vi.spyOn(Date, 'now').mockReturnValue(2400)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    logQueueWorkerRun({
      queue: 'onboarding_video_runs',
      workerId: 'worker_2',
      event: 'queue_worker_run_error',
      startedAtMs: 2000,
      processed: 1,
      failed: 1,
      retried: 0,
      error: 'database unavailable',
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(String(errorSpy.mock.calls[0]?.[0])) as Record<string, unknown>
    expect(payload.event).toBe('queue_worker_run_error')
    expect(payload.queue).toBe('onboarding_video_runs')
    expect(payload.worker_id).toBe('worker_2')
    expect(payload.processed).toBe(1)
    expect(payload.failed).toBe(1)
    expect(payload.error).toBe('database unavailable')
    expect(payload.latency_ms).toBe(400)
  })
})
