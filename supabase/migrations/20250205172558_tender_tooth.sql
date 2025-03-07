-- Create function to handle image status changes
CREATE OR REPLACE FUNCTION notify_image_status_change()
RETURNS trigger AS $$
DECLARE
  v_owner_id uuid;
  v_business_name text;
BEGIN
  -- Get business owner ID and name
  SELECT owner_id, name 
  INTO v_owner_id, v_business_name
  FROM businesses 
  WHERE id = NEW.business_id;

  IF NEW.status != OLD.status THEN
    -- Insert notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      v_owner_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'listing_approved'
        WHEN NEW.status = 'rejected' THEN 'listing_rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Image Approved'
        WHEN NEW.status = 'rejected' THEN 'Image Rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your business image has been approved and is now visible.'
        WHEN NEW.status = 'rejected' THEN 'Your business image has been rejected. Please upload a new image.'
      END,
      jsonb_build_object(
        'business_id', NEW.business_id,
        'business_name', v_business_name,
        'image_url', NEW.url
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new comments
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS trigger AS $$
DECLARE
  v_owner_id uuid;
  v_business_name text;
BEGIN
  -- Get business owner ID and name
  SELECT owner_id, name 
  INTO v_owner_id, v_business_name
  FROM businesses 
  WHERE id = NEW.business_id;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_owner_id,
    'comment_received',
    'New Comment',
    'Someone has commented on your business listing.',
    jsonb_build_object(
      'business_id', NEW.business_id,
      'business_name', v_business_name,
      'comment_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle report status changes
CREATE OR REPLACE FUNCTION notify_report_status_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Insert notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      NEW.reporter_id,
      'report_status',
      'Report Status Updated',
      CASE 
        WHEN NEW.status = 'investigating' THEN 'Your report is being investigated.'
        WHEN NEW.status = 'resolved' THEN 'Your report has been resolved.'
        WHEN NEW.status = 'dismissed' THEN 'Your report has been dismissed.'
      END,
      jsonb_build_object(
        'report_id', NEW.id,
        'business_id', NEW.business_id,
        'status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS notify_image_status_change ON business_images;
CREATE TRIGGER notify_image_status_change
  AFTER UPDATE ON business_images
  FOR EACH ROW
  EXECUTE FUNCTION notify_image_status_change();

DROP TRIGGER IF EXISTS notify_new_comment ON business_comments;
CREATE TRIGGER notify_new_comment
  AFTER INSERT ON business_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment();

DROP TRIGGER IF EXISTS notify_report_status_change ON business_reports;
CREATE TRIGGER notify_report_status_change
  AFTER UPDATE ON business_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_report_status_change();

-- Create function to send system announcements
CREATE OR REPLACE FUNCTION send_system_announcement(
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  SELECT 
    id,
    'system_announcement',
    p_title,
    p_message,
    p_data
  FROM auth.users;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION send_system_announcement TO authenticated;