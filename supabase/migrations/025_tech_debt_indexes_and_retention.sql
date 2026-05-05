-- Missing index: company_signals by user_id + signal_date
-- The briefing job and signals page query on this combination frequently.
create index if not exists idx_company_signals_user_date
  on public.company_signals(user_id, signal_date desc);

-- Conversation retention: hard cap at 300 messages per conversation.
-- Older messages beyond 300 are dropped to prevent unbounded growth.
create or replace function trim_conversation_messages()
returns trigger language plpgsql as $$
begin
  if jsonb_array_length(new.messages) > 300 then
    new.messages := (
      select jsonb_agg(msg)
      from (
        select msg
        from jsonb_array_elements(new.messages) as msg
        order by ordinality desc
        limit 300
      ) sub
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_trim_conversation_messages on public.conversations;
create trigger trg_trim_conversation_messages
  before insert or update on public.conversations
  for each row execute function trim_conversation_messages();

-- Signal retention: delete signals older than 90 days.
-- Run via the cleanup cron in the worker.
create or replace function delete_old_signals()
returns integer language plpgsql as $$
declare
  deleted integer;
begin
  delete from public.company_signals
  where signal_date < (current_date - interval '90 days');
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

-- Conversation cleanup: delete conversations not updated in 180 days.
create or replace function delete_stale_conversations()
returns integer language plpgsql as $$
declare
  deleted integer;
begin
  delete from public.conversations
  where updated_at < (now() - interval '180 days');
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;
