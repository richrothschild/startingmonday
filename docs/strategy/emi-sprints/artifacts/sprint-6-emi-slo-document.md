# Sprint 6 Artifact: EMI SLO Document

Date: 2026-05-25
Owner: Engineering
Status: Completed

## Objective

Define reliability objectives for EMI critical flows and lock monitoring ownership.

## Critical Flow SLOs

1. Assessment flow availability: 99.9 percent
2. Daily loop load success: 99.5 percent
3. Weekly digest generation success: 99.5 percent
4. Critical event ingestion latency under 5 minutes for 95th percentile

## Error Budget Policy

1. Exceeding monthly error budget triggers release hardening review.
2. Repeated breach in two periods triggers remediation sprint prioritization.

## Ownership

1. Product engineering owns instrumentation correctness.
2. SRE owns alerting and incident review.

## Release Notes

1. EMI critical-flow SLOs finalized and adopted.
