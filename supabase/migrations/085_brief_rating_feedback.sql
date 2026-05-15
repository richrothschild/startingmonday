-- Add optional text feedback field to brief ratings
alter table briefs add column if not exists rating_feedback text;
