# Landing Page Standard (Sitewide)

This standard uses the home page as the reference style system and applies it to every route through strict measurable checks.

## Standard Principles

- Luxury visual system consistency: dark-slate base, orange accent, refined spacing, high-contrast type.
- Cognitive fluency first: each page should support clear orientation, clear next action, and minimal ambiguity.
- Shell consistency: each page must use an approved shell family derived from landing conventions.
- Interaction reliability: primary controls must be wired and actionable.

## Approved Shell Families

- landing-shell: direct usage of the shared LandingPage component.
- marketing-shell: public pages using shared marketing chrome components.
- dashboard-shell: authenticated dashboard route family.
- auth-shell: authentication route family.
- custom-shell: explicit nav + footer structure with landing-aligned palette tokens.

## Required Checks (All Pages)

- shell_standard: page resolves to an approved shell family.
- luxury_look_and_feel: shell + palette + non-high cognitive load.
- thought_process_alignment: visible content hierarchy and orientation pattern.
- cognitive_load: must be good or excellent (high fails strict mode).
- palette_consistency: landing-aligned palette evidence.
- button_wiring: no obviously orphaned actionable buttons.
- header_footer_consistency: shell-level header/footer contract is present.

## Strict Enforcement

- Any failed required check fails strict mode.
- Strict mode is required for scheduled monitoring and PR gating.
- Reports are generated as JSON and Markdown for traceability.

## Monitoring

- Full-site strict audit runs twice daily.
- Any strict failure triggers a Slack alert with run URL and artifact pointers.
