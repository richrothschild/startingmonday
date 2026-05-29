# Outreach Trigger Field Reference

Use these input fields in CRM exports or scraping outputs to auto-populate template trigger lines.

## Trigger Inputs Supported

### newsTrigger aliases

- trigger_news
- news_trigger
- recent_news
- news_event
- company_news
- news_summary

### postTrigger aliases

- trigger_post
- post_trigger
- recent_post
- linkedin_post
- social_post
- post_summary

### profileTrigger aliases

- trigger_profile
- profile_trigger
- profile_signal
- personalization_line
- profile_note
- contact_note
- notes

## Selection Rules

1. For each trigger type, the first non-empty alias is selected.
2. In template rendering, trigger priority is newsTrigger, then postTrigger, then profileTrigger.
3. If all trigger inputs are empty, the engine uses a channel-specific fallback trigger line.

## Minimal Provider Payload Example

- full_name
- company
- role_bucket or title
- persona_focus
- one or more trigger alias fields above
