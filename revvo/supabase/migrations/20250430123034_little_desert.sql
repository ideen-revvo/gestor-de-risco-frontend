/*
  # Fix user trigger function to match table definitions

  1. Changes
    - Update trigger function to properly handle user signup
    - Match column types with table definitions
    - Handle company and user_profile creation correctly
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
  new_company_id bigint;
BEGIN
  -- Check if user was created through signup (has company_name in metadata)
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    -- Create new company record
    INSERT INTO public.company (
      name,
      doc_num,
      creator
    )
    VALUES (
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'cnpj',
      NEW.id
    )
    RETURNING id INTO new_company_id;

    -- Create user profile for signup
    INSERT INTO public.user_profile (
      name,
      email,
      doc_id,
      company_id,
      role_id,
      "UUID"
    )
    VALUES (
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      NEW.raw_user_meta_data->>'cnpj',
      new_company_id,
      1, -- Default role_id for company creator
      NEW.id
    );
  ELSE
    -- User created through invitation
    INSERT INTO public.user_profile (
      name,
      email,
      company_id,
      "UUID"
    )
    VALUES (
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      (NEW.raw_user_meta_data->>'company_id')::bigint,
      NEW.id
    );
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