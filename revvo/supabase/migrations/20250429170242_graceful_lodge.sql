/*
  # Add trigger for user profile creation

  1. New Functions
    - `handle_new_user`: Creates user profile when a new user is created
      - Triggered after auth.users insert
      - Creates user_profile record with role_id = 1 for signup
      - Creates user_profile record without role for invites

  2. Security
    - Function runs with security definer
    - Only triggered by auth system
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- User created through signup
    INSERT INTO public.user_profile (
      id,
      email,
      name,
      doc_id,
      role_id,
      company_id
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'cnpj',
      1, -- Default role_id for signup
      5  -- Default company_id
    );
  ELSE
    -- User created through invitation
    INSERT INTO public.user_profile (
      id,
      email,
      name,
      company_id
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      5  -- Default company_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();