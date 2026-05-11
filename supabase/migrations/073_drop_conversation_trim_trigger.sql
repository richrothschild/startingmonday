-- The application enforces a 200-message limit in conversation/route.ts.
-- The DB trigger added in 025 capped at 300 — a different threshold in the wrong layer.
-- Dropping both to keep business logic in the application layer only.
DROP TRIGGER IF EXISTS trg_trim_conversation_messages ON conversation_messages;
DROP FUNCTION IF EXISTS trim_conversation_messages();
