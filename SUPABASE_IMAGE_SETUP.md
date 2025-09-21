# Supabase 비디오 이미지 업로드 설정 가이드

## 1. video_content 테이블에 image_url 컬럼 추가

### Supabase Dashboard에서 SQL 실행하기:

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 다음 SQL 쿼리를 실행:

```sql
-- video_content 테이블에 image_url 컬럼 추가
ALTER TABLE public.video_content
ADD COLUMN IF NOT EXISTS image_url text;
```

## 2. Storage 버킷 확인

비디오/블로그 이미지는 `content-images` 버킷에 저장됩니다.

### Storage 버킷이 없는 경우:

1. Supabase Dashboard에서 **Storage** 메뉴 클릭
2. **New bucket** 버튼 클릭
3. 버킷 이름: `content-images`
4. Public bucket 옵션 활성화 (이미지 공개 접근 허용)
5. **Create bucket** 클릭

### Storage 정책 설정:

```sql
-- 누구나 이미지를 볼 수 있도록 설정
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');
```

## 3. 테이블 스키마 확인

현재 video_content 테이블 구조 확인:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'video_content'
ORDER BY ordinal_position;
```

## 4. 문제 해결

### 이미지 업로드가 안 될 때:
- Storage 버킷이 생성되었는지 확인
- 버킷이 public으로 설정되었는지 확인
- image_url 컬럼이 추가되었는지 확인

### 권한 오류가 날 때:
- RLS 정책이 올바르게 설정되었는지 확인
- Storage 정책이 올바르게 설정되었는지 확인

## 5. 테스트

1. 비디오 콘텐츠 작성 페이지로 이동
2. 이미지 업로드 테스트
3. 저장 후 콘텐츠 관리 페이지에서 확인
4. 홈페이지에서 이미지가 정상적으로 표시되는지 확인