-- Function to transfer host privileges between participants
-- This ensures atomic host transfer operations

CREATE OR REPLACE FUNCTION transfer_stream_host(
  stream_uuid UUID,
  current_host_uuid UUID,
  new_host_uuid UUID
)
RETURNS VOID AS $
BEGIN
  -- Verify current host is actually the host
  IF NOT EXISTS (
    SELECT 1 FROM stream_participants 
    WHERE stream_id = stream_uuid 
      AND user_id = current_host_uuid 
      AND is_host = true
  ) THEN
    RAISE EXCEPTION 'Current user is not the host of this stream';
  END IF;

  -- Verify new host is a participant
  IF NOT EXISTS (
    SELECT 1 FROM stream_participants 
    WHERE stream_id = stream_uuid 
      AND user_id = new_host_uuid
  ) THEN
    RAISE EXCEPTION 'New host is not a participant in this stream';
  END IF;

  -- Perform the transfer atomically
  UPDATE stream_participants 
  SET is_host = false 
  WHERE stream_id = stream_uuid 
    AND user_id = current_host_uuid;

  UPDATE stream_participants 
  SET is_host = true 
  WHERE stream_id = stream_uuid 
    AND user_id = new_host_uuid;
END;
$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION transfer_stream_host(UUID, UUID, UUID) TO authenticated;