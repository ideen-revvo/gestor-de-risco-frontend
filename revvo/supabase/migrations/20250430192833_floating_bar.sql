/*
  # Update user invite handling

  1. Changes
    - Update trigger function to handle Supabase Auth invites
    - Store invite metadata in user_invite table
    - Update user_profile creation to use invite data
    - Add proper error handling

  2. Security
    - Maintain security definer
    - Keep existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
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
      "UUID",
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
    -- Get invite record
    SELECT * INTO invite_record
    FROM user_invite
    WHERE id = (NEW.raw_user_meta_data->>'invite_id')::uuid;

    IF FOUND THEN
      -- Create user profile from invite data
      INSERT INTO public.user_profile (
        "UUID",
        email,
        name,
        company_id,
        invite_id,
        created_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        invite_record.name,
        invite_record.company_id,
        invite_record.id,
        NOW()
      );
    ELSE
      RAISE EXCEPTION 'No valid invite found';
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

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();