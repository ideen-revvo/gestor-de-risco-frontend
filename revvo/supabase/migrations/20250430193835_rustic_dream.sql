/*
  # Add user invite functionality

  1. Changes
    - Add invite_url column to user_invite table
    - Create function to generate invite URL
    - Update policies to allow invite management

  2. Security
    - Maintain existing RLS policies
    - Add URL generation security
*/

-- Add invite_url column
ALTER TABLE user_invite
ADD COLUMN invite_url text;

-- Create function to generate invite URL
CREATE OR REPLACE FUNCTION generate_invite_url(invite_id uuid)
RETURNS text AS $$
BEGIN
  RETURN format(
    '%s/signup?invite=%s',
    current_setting('app.frontend_url', true),
    invite_id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to generate invite URL
CREATE OR REPLACE FUNCTION set_invite_url()
RETURNS trigger AS $$
BEGIN
  NEW.invite_url := generate_invite_url(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER generate_invite_url_trigger
  BEFORE INSERT ON user_invite
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_url();

-- Update user_invite policies
CREATE POLICY "Allow viewing own invites"
  ON user_invite
  FOR SELECT
  TO authenticated
  USING (
    invited_by = auth.uid() OR
    email = auth.email()
  );