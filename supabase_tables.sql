-- Create video_content table
CREATE TABLE public.video_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    youtube_url text NOT NULL,
    category text NOT NULL,
    keywords text[],
    is_premium boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create blog_content table
CREATE TABLE public.blog_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    keywords text[],
    is_premium boolean DEFAULT false,
    image text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.video_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_content
-- Allow anyone to read content
CREATE POLICY "Anyone can view video content" ON public.video_content
    FOR SELECT USING (true);

-- Only authenticated users can insert content
CREATE POLICY "Authenticated users can insert video content" ON public.video_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for blog_content
-- Allow anyone to read content
CREATE POLICY "Anyone can view blog content" ON public.blog_content
    FOR SELECT USING (true);

-- Only authenticated users can insert content
CREATE POLICY "Authenticated users can insert blog content" ON public.blog_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_video_content_updated_at
    BEFORE UPDATE ON public.video_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_content_updated_at
    BEFORE UPDATE ON public.blog_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();