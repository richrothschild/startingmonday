import { logger } from './logger.js'

/**
 * Notification channel for WARN ingestion alerts
 * Handles deduplication, multi-channel delivery (in-app, email, Slack)
 */
export class WarnNotificationService {
  constructor(supabase) {
    this.supabase = supabase
  }

  /**
   * Create in-app notification alert for a new WARN event
   * Links directly to company in discover flow
   */
  async notifyNewWarnEvent({ canonicalCompanyId, employerName, stateCode, eventDate, jobLosses }) {
    if (!canonicalCompanyId) return null

    try {
      const title = `${employerName} filed WARN notice in ${stateCode}`
      
      // Store all data in metadata to avoid schema cache issues with optional columns
      const metadata = {
        warn_state: stateCode,
        job_losses: jobLosses,
        source_kind: 'warn_notice',
        employer_name: employerName,
        event_date: eventDate,
        description: `Layoff notice filed. ${jobLosses ? `Approximately ${jobLosses} roles affected.` : ''}`,
      }

      // Insert using only columns that are in the schema cache
      // (description, event_date, related_entity_* columns are causing cache issues)
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          company_id: canonicalCompanyId,
          notification_type: 'warn_notice_filed',
          title,
          is_read: false,
          priority: 'high',
          action_url: `/dashboard/discover/company/${canonicalCompanyId}`,
          metadata,
        })

      if (error) {
        logger.warn('warn-notifications: failed to create in-app notification', {
          error: error?.message,
          companyId: canonicalCompanyId,
        })
        return null
      }

      logger.info('warn-notifications: created in-app alert', {
        companyId: canonicalCompanyId,
        employer: employerName,
        state: stateCode,
      })

      return data?.[0] || true
    } catch (err) {
      logger.error('warn-notifications: unexpected error creating notification', {
        error: err?.message,
        companyId: canonicalCompanyId,
      })
      return null
    }
  }

  /**
   * Batch notify for a collection of newly detected WARN events
   * Aggregates by company to avoid notification spam
   */
  async notifyBatch(warnEvents) {
    const results = { notified: 0, failed: 0, duplicates: 0 }

    if (!Array.isArray(warnEvents) || warnEvents.length === 0) {
      return results
    }

    // Group by company to prevent duplicate notifications
    const byCompany = new Map()
    for (const event of warnEvents) {
      if (!event.canonicalCompanyId) continue
      if (!byCompany.has(event.canonicalCompanyId)) {
        byCompany.set(event.canonicalCompanyId, [])
      }
      byCompany.get(event.canonicalCompanyId).push(event)
    }

    // Check for recent notifications to avoid duplicates
    const recentWindow = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    for (const [companyId, events] of byCompany.entries()) {
      try {
        const { data: recent } = await this.supabase
          .from('notifications')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId)
          .eq('notification_type', 'warn_notice_filed')
          .gte('created_at', recentWindow.toISOString())

        if (recent && recent.length > 0) {
          results.duplicates += events.length
          continue
        }

        // Notify for this company's primary event
        const primaryEvent = events[0]
        const result = await this.notifyNewWarnEvent(primaryEvent)
        if (result) {
          results.notified += 1
        } else {
          results.failed += 1
        }
      } catch (err) {
        logger.error('warn-notifications: batch notify error', {
          error: err?.message,
          companyId,
        })
        results.failed += 1
      }
    }

    logger.info('warn-notifications: batch complete', results)
    return results
  }

  /**
   * Get notification stats for dashboard observability
   */
  async getNotificationStats(hoursBack = 24) {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('notification_type, is_read')
        .eq('notification_type', 'warn_notice_filed')
        .gte('created_at', since.toISOString())

      if (error) {
        logger.warn('warn-notifications: failed to get stats', { error: error?.message })
        return null
      }

      const stats = {
        total: data?.length || 0,
        unread: data?.filter((n) => !n.is_read).length || 0,
        read: data?.filter((n) => n.is_read).length || 0,
      }

      return stats
    } catch (err) {
      logger.error('warn-notifications: unexpected error fetching stats', {
        error: err?.message,
      })
      return null
    }
  }
}
