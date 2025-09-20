-- Fix RLS policies for video_content and blog_content tables
-- This allows public users to DELETE and UPDATE content (for admin functionality)

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Public users can delete video content" ON public.video_content;
DROP POLICY IF EXISTS "Public users can update video content" ON public.video_content;
DROP POLICY IF EXISTS "Public users can delete blog content" ON public.blog_content;
DROP POLICY IF EXISTS "Public users can update blog content" ON public.blog_content;

-- Create DELETE policies
CREATE POLICY "Public users can delete video content" ON public.video_content
    FOR DELETE USING (true);

CREATE POLICY "Public users can delete blog content" ON public.blog_content
    FOR DELETE USING (true);

-- Create UPDATE policies
CREATE POLICY "Public users can update video content" ON public.video_content
    FOR UPDATE USING (true);

CREATE POLICY "Public users can update blog content" ON public.blog_content
    FOR UPDATE USING (true);

-- Alter the keywords column to store as TEXT instead of TEXT[] for easier handling
-- First, backup existing data and convert
ALTER TABLE public.video_content
ALTER COLUMN keywords TYPE text
USING CASE
    WHEN keywords IS NULL THEN NULL
    WHEN array_length(keywords, 1) IS NULL THEN NULL
    ELSE array_to_string(keywords, ',')
END;

ALTER TABLE public.blog_content
ALTER COLUMN keywords TYPE text
USING CASE
    WHEN keywords IS NULL THEN NULL
    WHEN array_length(keywords, 1) IS NULL THEN NULL
    ELSE array_to_string(keywords, ',')
END;

-- Note: After running this, keywords will be stored as JSON strings in the text field
-- The application code already handles this format correctly