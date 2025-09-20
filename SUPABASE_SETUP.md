# Supabase 데이터베이스 설정 가이드

## 문제 해결

### 1. 콘텐츠 삭제가 안 되는 경우

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- DELETE와 UPDATE 권한 추가
CREATE POLICY "Public users can delete video content" ON public.video_content
    FOR DELETE USING (true);

CREATE POLICY "Public users can update video content" ON public.video_content
    FOR UPDATE USING (true);

CREATE POLICY "Public users can delete blog content" ON public.blog_content
    FOR DELETE USING (true);

CREATE POLICY "Public users can update blog content" ON public.blog_content
    FOR UPDATE USING (true);
```

### 2. 개발 환경에서 빠른 테스트 (비추천)

개발 환경에서만 사용하세요. **프로덕션에서는 절대 사용하지 마세요!**

```sql
-- RLS 일시 비활성화
ALTER TABLE public.video_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_content DISABLE ROW LEVEL SECURITY;
```

### 3. 키워드 데이터 타입 변경 (선택사항)

현재 keywords가 text[] 배열로 저장되어 있다면 text로 변경:

```sql
-- 키워드 컬럼을 TEXT로 변경 (JSON 문자열로 저장)
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
```

## 프로덕션 권장 설정

프로덕션에서는 적절한 인증과 함께 RLS 정책을 사용하세요:

```sql
-- 인증된 사용자만 삭제/수정 가능
CREATE POLICY "Authenticated users can delete video content" ON public.video_content
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update video content" ON public.video_content
    FOR UPDATE USING (auth.role() = 'authenticated');
```