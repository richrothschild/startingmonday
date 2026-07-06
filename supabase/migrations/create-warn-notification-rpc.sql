-- Create a function to insert notifications, bypassing schema cache issues
CREATE OR REPLACE FUNCTION create_warn_notification(
  p_company_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_event_date DATE,
  p_related_entity_id UUID,
  p_related_entity_type TEXT,
  p_is_read BOOLEAN,
  p_priority TEXT,
  p_action_url TEXT,
  p_metadata JSONB
) RETURNS SETOF notifications AS $$
  INSERT INTO notifications (
    company_id,
    notification_type,
    title,
    description,
    event_date,
    related_entity_id,
    related_entity_type,
    is_read,
    priority,
    action_url,
    metadata
  ) VALUES (
    p_company_id,
    p_notification_type,
    p_title,
    p_description,
    p_event_date,
    p_related_entity_id,
    p_related_entity_type,
    p_is_read,
    p_priority,
    p_action_url,
    p_metadata
  )
  RETURNING *;
$$ LANGUAGE SQL;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_warn_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_warn_notification TO anon;
