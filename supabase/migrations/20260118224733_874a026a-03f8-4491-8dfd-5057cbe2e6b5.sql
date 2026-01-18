-- RLS policies for folders
CREATE POLICY "Deny anonymous access to folders"
ON public.folders FOR SELECT
TO anon
USING (false);

CREATE POLICY "Users can view their own folders"
ON public.folders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.folders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.folders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.folders FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN cover_image_url text,
ADD COLUMN last_viewed_at timestamptz,
ADD COLUMN is_favorite boolean DEFAULT false,
ADD COLUMN folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL;