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
  new_user_id bigint;
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

    -- Get next user_profile id
    SELECT nextval('user_profile_id_seq') INTO new_user_id;

    -- Create user profile for signup
    INSERT INTO public.user_profile (
      id,
      email,
      name,
      role_id,
      company_id,
      "UUID"
    )
    VALUES (
      new_user_id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      1,  -- Default role_id for company creator
      new_company_id,
      NEW.id
    );
  ELSE
    -- Get next user_profile id for invitation
    SELECT nextval('user_profile_id_seq') INTO new_user_id;

    -- User created through invitation
    INSERT INTO public.user_profile (
      id,
      email,
      name,
      company_id,
      "UUID"
    )
    VALUES (
      new_user_id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
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