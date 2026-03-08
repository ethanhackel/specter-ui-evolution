-- Add ban columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN banned_at timestamp with time zone,
  ADD COLUMN ban_reason text;

-- Security definer function to check ban status
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_banned FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Allow admins to update any profile (for banning)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
