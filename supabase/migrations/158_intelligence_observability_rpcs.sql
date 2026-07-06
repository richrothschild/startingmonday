-- Intelligence Scanner Observability RPC Functions (Epic E0 + E1)
-- Exposes aggregated metrics for admin dashboard monitoring.

-- Get event deduplication efficiency stats for the past N hours.
-- Returns: events_created, events_merged, duplicate_rate_percent, sources_per_event_avg
create or replace function get_event_dedup_stats(hours_back int default 24)
returns table (
  events_created bigint,
  events_merged bigint,
  duplicate_rate_percent numeric,
  sources_per_event_avg numeric,
  avg_corroboration_count numeric
) language sql as $$
  select
    count(*) filter (where corroboration_count = 1) as events_created,
    count(*) filter (where corroboration_count > 1) as events_merged,
    round(
      100.0 * count(*) filter (where corroboration_count > 1) / nullif(count(*), 0),
      2
    ) as duplicate_rate_percent,
    round(avg(jsonb_array_length(sources)), 2) as sources_per_event_avg,
    round(avg(corroboration_count), 2) as avg_corroboration_count
  from company_events
  where created_at >= now() - (hours_back || ' hours')::interval;
$$ security definer set search_path = 'public';

-- Get top signal sources by event creation rate (observability for source health).
-- Returns: source_key, total_runs, avg_events_per_run, total_events, failure_rate_percent
create or replace function get_signal_source_health(hours_back int default 24)
returns table (
  source_key text,
  total_runs int,
  avg_events_per_run numeric,
  total_events_created bigint,
  classify_failure_rate numeric
) language sql as $$
  select
    source_key,
    count(*) as total_runs,
    round(avg(events_created), 2) as avg_events_per_run,
    sum(events_created) as total_events_created,
    case
      when sum(classify_calls) > 0
        then round(100.0 * sum(classify_failures) / sum(classify_calls), 2)
      else 0
    end as classify_failure_rate
  from source_run_metrics
  where created_at >= now() - (hours_back || ' hours')::interval
  group by source_key
  order by total_events_created desc;
$$ security definer set search_path = 'public';

-- Provenance audit: % of events with complete provenance columns (raw_fetch_ref, content_hash, model_version).
create or replace function get_provenance_coverage(hours_back int default 24)
returns table (
  total_events bigint,
  events_with_ref bigint,
  events_with_hash bigint,
  events_with_model bigint,
  coverage_percent numeric
) language sql as $$
  select
    count(*)::bigint as total_events,
    count(*) filter (where raw_fetch_ref is not null)::bigint as events_with_ref,
    count(*) filter (where content_hash is not null)::bigint as events_with_hash,
    count(*) filter (where model_version is not null)::bigint as events_with_model,
    round(
      100.0 * count(*) filter (
        where raw_fetch_ref is not null and content_hash is not null and model_version is not null
      ) / nullif(count(*), 0),
      2
    )::numeric as coverage_percent
  from company_events
  where created_at >= now() - (hours_back || ' hours')::interval;
$$ security definer set search_path = 'public';
