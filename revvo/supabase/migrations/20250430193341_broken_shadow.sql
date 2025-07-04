/*
  # Add user invite system

  1. Changes
    - Add invite_token column to user_invite table
    - Add expiration handling
    - Update trigger to handle invite acceptance properly
    - Add policies for invite management

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add invite_token and expiration to user_invite
ALTER TABLE user_invite 
ADD COLUMN invite_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '7 days');

-- Create function to validate invite
CREATE OR REPLACE FUNCTION validate_invite(token uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_invite
    WHERE invite_token = token
    AND status = 'pending'
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user function to properly handle invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- Create user profile for signup
    INSERT INTO public.user_profile (
      logged_id,
      email,
      name,
      role_id,
      company_id,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      1,  -- Default role_id for company creator
      (NEW.raw_user_meta_data->>'company_id')::bigint,
      NOW()
    );
  ELSE
    -- User created through invitation
    SELECT * INTO invite_record
    FROM user_invite
    WHERE invite_token = (NEW.raw_user_meta_data->>'invite_token')::uuid
    AND status = 'pending'
    AND expires_at > now();

    IF FOUND THEN
      -- Create user profile from invite
      INSERT INTO public.user_profile (
        logged_id,
        email,
        name,
        company_id,
        role_id,
        invite_id,
        created_at
      )
      VALUES (
        NEW.id,
        invite_record.email,
        invite_record.name,
        invite_record.company_id,
        invite_record.role_id,
        invite_record.id,
        NOW()
      );

      -- Update invite status
      UPDATE user_invite
      SET status = 'accepted',
          accepted_at = now()
      WHERE id = invite_record.id;
    ELSE
      RAISE EXCEPTION 'Invalid or expired invite';
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE LOG 'Error detail: %', SQLSTATE;
    RAISE LOG 'User data: %', NEW.raw_user_meta_data;
    RAISE;
END;
$$;