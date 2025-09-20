-- Supabase Storage 버킷 생성을 위한 SQL
-- Supabase 대시보드에서 실행하세요

-- blog-images 버킷 생성 (이미 존재할 수 있음)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true, -- public access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 모든 사용자가 이미지를 볼 수 있도록 정책 생성
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- 인증된 사용자만 업로드할 수 있도록 정책 생성
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
  );

-- 인증된 사용자가 자신의 이미지를 삭제할 수 있도록 정책 생성
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
  );