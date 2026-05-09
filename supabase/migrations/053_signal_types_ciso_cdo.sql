-- Add signal types for CISO-relevant events (breach_disclosure, regulatory_change)
-- and CDO/data-relevant events (data_platform, ai_investment).

alter table public.company_signals
  drop constraint if exists company_signals_signal_type_check;

alter table public.company_signals
  add constraint company_signals_signal_type_check
  check (signal_type in (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award',
    'pattern_alert', 'filing_trend',
    'breach_disclosure', 'regulatory_change',
    'data_platform', 'ai_investment'
  ));
