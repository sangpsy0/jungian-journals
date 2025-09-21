-- video_content 테이블에 image_url 컬럼 추가
ALTER TABLE public.video_content
ADD COLUMN IF NOT EXISTS image_url text;

-- 기존 데이터가 있다면 NULL 값으로 설정됨
-- 필요시 기본값 설정 가능
-- ALTER TABLE public.video_content
-- ALTER COLUMN image_url SET DEFAULT NULL;

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'video_content'
AND column_name = 'image_url';