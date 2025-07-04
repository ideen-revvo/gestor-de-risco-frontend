/*
  # Update user signup trigger to handle company creation

  1. Changes
    - Drop existing trigger and function
    - Create new function to handle company creation
    - Create user profile with proper role and company association
    - Handle both signup and invite scenarios

  2. Security
    - Function runs with security definer
    - Only triggered by auth system
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
  new_company_id bigint;
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- Create new company record
    INSERT INTO public.company (
      name,
      doc_num,
      creator,
      company_code
    )
    VALUES (
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'cnpj',
      NEW.id,
      NEW.raw_user_meta_data->>'company_name'
    )
    RETURNING id INTO new_company_id;

    -- Create user profile for signup
    INSERT INTO public.user_profile (
      "UUID",
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
      NEW.raw_user_meta_data->>'doc_id',
      1, -- Default role_id for signup (account creator)
      new_company_id
    );
  ELSE
    -- User created through invitation
    INSERT INTO public.user_profile (
      "UUID",
      email,
      name,
      company_id
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'company_id'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();