/*
  # Fix user invite workflow

  1. Changes
    - Add invite_id column to user_profile
    - Add status column to user_invite
    - Add policies for invite management
    - Add function to handle invite acceptance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add invite_id to user_profile
ALTER TABLE user_profile
ADD COLUMN invite_id uuid REFERENCES user_invite(id);

-- Add status to user_invite
ALTER TABLE user_invite
ADD COLUMN status text DEFAULT 'pending'
CHECK (status IN ('pending', 'accepted', 'expired'));

-- Create function to handle invite acceptance
CREATE OR REPLACE FUNCTION handle_invite_acceptance()
RETURNS trigger AS $$
BEGIN
  -- Update invite status
  UPDATE user_invite
  SET status = 'accepted',
      accepted_at = NOW()
  WHERE id = NEW.invite_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invite acceptance
CREATE TRIGGER on_invite_accepted
  AFTER INSERT ON user_profile
  FOR EACH ROW
  WHEN (NEW.invite_id IS NOT NULL)
  EXECUTE FUNCTION handle_invite_acceptance();

-- Update user_invite policies
DROP POLICY IF EXISTS "Allow admins to manage invites" ON user_invite;

CREATE POLICY "Allow admins to create invites"
  ON user_invite
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );

CREATE POLICY "Allow admins to view invites"
  ON user_invite
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profile up
      WHERE up.logged_id = auth.uid()
      AND up.role_id = 1
    )
  );