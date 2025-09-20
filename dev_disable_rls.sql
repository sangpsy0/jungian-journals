-- 개발 환경에서 RLS를 일시적으로 비활성화 (테스트용)
-- 주의: 프로덕션에서는 절대 사용하지 마세요!

-- RLS 비활성화
ALTER TABLE public.video_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content DISABLE ROW LEVEL SECURITY;

-- 다시 활성화하려면:
-- ALTER TABLE public.video_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.blog_content ENABLE ROW LEVEL SECURITY;