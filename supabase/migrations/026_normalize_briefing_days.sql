-- Normalize abbreviated briefing_days values (Mon → Monday, etc.) to full names.
-- These were written by an older code path; the briefing job compares against
-- full names from Intl.DateTimeFormat, so abbreviated values never match.

update user_profiles
set briefing_days = (
  select array_agg(
    case d
      when 'Mon' then 'Monday'
      when 'Tue' then 'Tuesday'
      when 'Wed' then 'Wednesday'
      when 'Thu' then 'Thursday'
      when 'Fri' then 'Friday'
      when 'Sat' then 'Saturday'
      when 'Sun' then 'Sunday'
      else d
    end
    order by array_position(array['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      case d
        when 'Mon' then 'Monday'
        when 'Tue' then 'Tuesday'
        when 'Wed' then 'Wednesday'
        when 'Thu' then 'Thursday'
        when 'Fri' then 'Friday'
        when 'Sat' then 'Saturday'
        when 'Sun' then 'Sunday'
        else d
      end)
  )
  from unnest(briefing_days) as d
)
where briefing_days is not null
  and exists (
    select 1 from unnest(briefing_days) as d
    where d in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')
  );
