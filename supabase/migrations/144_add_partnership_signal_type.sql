-- Add partnership as a valid signal type to fix constraint violation
-- Error: writeSignal: new row for relation "company_signals" violates check constraint "company_signals_signal_type_check"
-- Root cause: signal-job.js assigns 'partnership' as signal_type but it wasn't in the constraint

alter table public.company_signals
  drop constraint if exists company_signals_signal_type_check;

alter table public.company_signals
  add constraint company_signals_signal_type_check
  check (signal_type in (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award',
    'pattern_alert', 'filing_trend',
    'breach_disclosure', 'regulatory_change',
    'data_platform', 'ai_investment',
    'board_change', 'transformation_budget',
    'activist_entry', 'insider_sale', 'partnership'
  ));
