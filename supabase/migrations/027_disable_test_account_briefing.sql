-- Null out briefing_time on the E2E test account so it stops receiving
-- real briefings. This account (VP of IT / Richard Rothschild test row)
-- has positioning_summary contaminated by Playwright test runs and should
-- not consume Anthropic + Resend budget with garbage context.
update user_profiles
set briefing_time = null
where user_id = '017c36a5-6578-49ba-8544-b64b46a000d5';
