/*
  # Fix user invite system and permissions

  1. Changes
    - Add service_role permission for invites
    - Update RLS policies
    - Add trigger for auth invite handling

  2. Security
    - Maintain existing RLS policies
    - Add proper role checks
*/

-- Create policy to allow service role to create invites
CREATE POLICY "Allow service role to create invites"
  ON auth.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Update user_invite policy to use service role
CREATE POLICY "Allow service role to manage invites"
  ON user_invite
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to handle auth invites
CREATE OR REPLACE FUNCTION handle_auth_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update invite status when auth invite is created
  UPDATE user_invite
  SET status_id = 1  -- pending
  WHERE email = NEW.email
  AND status_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auth invites
CREATE TRIGGER on_auth_invite_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'invite_id' IS NOT NULL)
  EXECUTE FUNCTION handle_auth_invite();