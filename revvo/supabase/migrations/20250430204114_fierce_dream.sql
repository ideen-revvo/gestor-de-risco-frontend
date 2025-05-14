-- Add policy to allow authenticated users to invite new users
CREATE POLICY "Allow authenticated users to invite"
  ON auth.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy to allow authenticated users to create invites
CREATE POLICY "Allow authenticated users to create invites"
  ON user_invite
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy to allow users to accept invites
CREATE POLICY "Allow users to accept invites"
  ON user_invite
  FOR UPDATE
  TO authenticated
  USING (email = auth.current_user()->>'email')
  WITH CHECK (email = auth.current_user()->>'email');

-- Enable RLS on user_invite if not already enabled
ALTER TABLE user_invite ENABLE ROW LEVEL SECURITY;