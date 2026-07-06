-- Create notifications table with full schema for WARN alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES canonical_companies(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  related_entity_id UUID,
  related_entity_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications(notification_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_event_date ON notifications(event_date DESC);

-- Enable RLS if needed
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
