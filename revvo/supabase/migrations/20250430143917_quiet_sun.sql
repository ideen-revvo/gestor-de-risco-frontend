/*
  # Add logged_id column to user_profile table

  1. Changes
    - Add logged_id column to user_profile table
    - Update existing records to copy UUID values to logged_id
    - Add index for faster lookups

  2. Security
    - Maintain existing security settings
*/

-- Add logged_id column
ALTER TABLE public.user_profile 
ADD COLUMN logged_id uuid;

-- Copy existing UUID values to logged_id
UPDATE public.user_profile 
SET logged_id = "UUID";

-- Create index for faster lookups
CREATE INDEX idx_user_profile_logged_id ON public.user_profile(logged_id);