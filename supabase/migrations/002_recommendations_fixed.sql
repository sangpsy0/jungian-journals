-- ============================================
-- 추천 시스템을 위한 데이터베이스 구조 생성 (수정본)
-- ============================================

-- 1. 사용자 시청 기록 테이블 생성
CREATE TABLE IF NOT EXISTS user_view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_content(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, video_id)
);

-- 2. 비디오에 조회수 컬럼 추가
ALTER TABLE video_content
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 3. 시청 기록 저장 함수
CREATE OR REPLACE FUNCTION record_video_view(
  p_user_id UUID,
  p_video_id UUID,
  p_duration INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_view_history (user_id, video_id, view_duration, viewed_at)
  VALUES (p_user_id, p_video_id, p_duration, NOW())
  ON CONFLICT (user_id, video_id)
  DO UPDATE SET
    viewed_at = NOW(),
    view_duration = COALESCE(p_duration, user_view_history.view_duration);

  UPDATE video_content
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_video_id;
END;
$$;

-- 4. 키워드 기반 추천 함수 (TEXT[] 배열로 수정)
CREATE OR REPLACE FUNCTION get_keyword_recommendations(
  p_video_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  keywords TEXT[],
  tab TEXT,
  youtube_id TEXT,
  thumbnail TEXT,
  added_date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  is_premium BOOLEAN,
  image_url TEXT,
  score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_keywords_json JSONB;
  current_tab TEXT;
BEGIN
  -- JSON 형태의 keywords와 tab 가져오기
  SELECT v.keywords::JSONB, v.tab
  INTO current_keywords_json, current_tab
  FROM video_content v
  WHERE v.id = p_video_id;

  RETURN QUERY
  WITH scored_videos AS (
    SELECT
      v.id,
      v.title,
      v.summary,
      ARRAY(SELECT jsonb_array_elements_text(v.keywords::jsonb)) as keywords,
      v.tab,
      v.youtube_id,
      v.thumbnail,
      v.added_date,
      v.type,
      v.is_premium,
      v.image_url,
      (
        -- 같은 카테고리 점수
        CASE WHEN v.tab = current_tab THEN 30 ELSE 0 END +
        -- 키워드 매칭 점수 (JSON 비교)
        (
          SELECT COUNT(*) * 15
          FROM jsonb_array_elements_text(v.keywords::jsonb) AS keyword
          WHERE current_keywords_json ? keyword
        ) +
        -- 최신 콘텐츠 가산점
        CASE WHEN v.added_date > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END +
        -- 인기도 점수
        COALESCE(LOG(v.view_count + 1) * 5, 0)
      )::FLOAT AS score
    FROM video_content v
    WHERE v.id != p_video_id
  )
  SELECT * FROM scored_videos
  WHERE score > 0
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;

-- 5. 개인화 추천 함수 (TEXT[] 배열로 수정)
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  keywords TEXT[],
  tab TEXT,
  youtube_id TEXT,
  thumbnail TEXT,
  added_date TIMESTAMP WITH TIME ZONE,
  type TEXT,
  is_premium BOOLEAN,
  image_url TEXT,
  score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  preferred_keywords TEXT[];
  preferred_tabs TEXT[];
  viewed_videos UUID[];
BEGIN
  -- 사용자가 본 비디오 ID들
  SELECT ARRAY_AGG(video_id)
  INTO viewed_videos
  FROM (
    SELECT video_id
    FROM user_view_history
    WHERE user_id = p_user_id
    ORDER BY viewed_at DESC
    LIMIT 20
  ) recent_views;

  -- 선호 키워드 수집 (JSON에서 추출)
  SELECT ARRAY_AGG(DISTINCT keyword)
  INTO preferred_keywords
  FROM (
    SELECT jsonb_array_elements_text(v.keywords::jsonb) AS keyword
    FROM video_content v
    WHERE v.id = ANY(viewed_videos)
  ) keywords
  LIMIT 20;

  -- 선호 카테고리 수집
  SELECT ARRAY_AGG(DISTINCT v.tab)
  INTO preferred_tabs
  FROM video_content v
  WHERE v.id = ANY(viewed_videos);

  RETURN QUERY
  WITH scored_videos AS (
    SELECT
      v.id,
      v.title,
      v.summary,
      ARRAY(SELECT jsonb_array_elements_text(v.keywords::jsonb)) as keywords,
      v.tab,
      v.youtube_id,
      v.thumbnail,
      v.added_date,
      v.type,
      v.is_premium,
      v.image_url,
      (
        -- 선호 카테고리 매칭
        CASE WHEN v.tab = ANY(preferred_tabs) THEN 40 ELSE 0 END +
        -- 선호 키워드 매칭 (JSON)
        (
          SELECT COUNT(*) * 10
          FROM jsonb_array_elements_text(v.keywords::jsonb) AS keyword
          WHERE keyword = ANY(preferred_keywords)
        ) +
        -- 인기도
        COALESCE(LOG(v.view_count + 1) * 5, 0) +
        -- 최신성
        CASE WHEN v.added_date > NOW() - INTERVAL '7 days' THEN 15 ELSE 0 END
      )::FLOAT AS score
    FROM video_content v
    WHERE NOT (v.id = ANY(viewed_videos)) OR viewed_videos IS NULL
  )
  SELECT * FROM scored_videos
  WHERE score > 0
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;

-- 6. RLS 정책 설정
ALTER TABLE user_view_history ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can view own history" ON user_view_history;
DROP POLICY IF EXISTS "Users can insert own history" ON user_view_history;
DROP POLICY IF EXISTS "Users can update own history" ON user_view_history;

-- 새 정책 생성
CREATE POLICY "Users can view own history" ON user_view_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON user_view_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON user_view_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. 인덱스 생성 (GIN 인덱스 제거, 일반 인덱스만 사용)
CREATE INDEX IF NOT EXISTS idx_user_view_history_user_id ON user_view_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_view_history_video_id ON user_view_history(video_id);
CREATE INDEX IF NOT EXISTS idx_user_view_history_viewed_at ON user_view_history(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_content_view_count ON video_content(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_content_tab ON video_content(tab);

-- keywords는 TEXT 타입이므로 GIN 인덱스 대신 일반 텍스트 검색 사용
-- CREATE INDEX IF NOT EXISTS idx_video_content_keywords ON video_content((keywords::jsonb));

-- ✅ 완료 메시지
SELECT 'Migration completed successfully!' as message;