
-- Create storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

-- Allow authenticated users to upload their own logos (folder = user_id)
CREATE POLICY "Users can upload their own brand logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own logos
CREATE POLICY "Users can update their own brand logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete their own brand logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read for brand logos (so they render in shared decks)
CREATE POLICY "Brand logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');
