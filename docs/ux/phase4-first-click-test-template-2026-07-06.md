# Phase 4 First-Click and 5-Second Test Template

Goal: validate immediate comprehension and first-action clarity on dashboard start.

## First-Click Test

Prompt:
- You just finished setup. Where would you click first to move your search forward today?

Success definition:
- First click is on highlighted next action card or its primary CTA.

Capture per participant:
- participant_id
- first_click_target
- success true or false
- time_to_click_seconds
- comment

Target:
- success rate >= 80 percent

## 5-Second Test

Prompt:
- Show dashboard start for 5 seconds.
- Ask: what is this page asking you to do next?

Success definition:
- user states one clear next action and why it matters.

Capture per participant:
- participant_id
- recalled_next_action
- recalled_value_statement
- success true or false
- confusion_notes

Target:
- >= 80 percent can name next action
- >= 70 percent can explain value statement

## Result Summary

| Metric | Result | Target | Pass |
|---|---|---|---|
| First-click success |  | >= 80% |  |
| Median time to click |  | <= 10s |  |
| 5-second next-action recall |  | >= 80% |  |
| 5-second value recall |  | >= 70% |  |
