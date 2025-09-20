-- Fix RLS policies for video_content and blog_content tables

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

-- Alter keywords column to TEXT type
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