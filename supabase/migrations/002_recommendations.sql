-- Enable pgvector extension (옵션 - Supabase가 지원하는 경우)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 사용자 시청 기록 테이블 생성
CREATE TABLE IF NOT EXISTS user_view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES video_content(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER, -- 시청 시간(초)
  completed BOOLEAN DEFAULT FALSE, -- 완료 여부
  UNIQUE(user_id, video_id)
);

-- 비디오에 조회수 컬럼 추가
ALTER TABLE video_content
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 비디오에 임베딩 컬럼 추가 (pgvector 사용 시)
-- ALTER TABLE video_content
-- ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 비디오 유사도 검색을 위한 인덱스 (pgvector 사용 시)
-- CREATE INDEX IF NOT EXISTS video_content_embedding_idx
-- ON video_content
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- 사용자가 비디오를 볼 때 기록하는 함수
CREATE OR REPLACE FUNCTION record_video_view(
  p_user_id UUID,
  p_video_id UUID,
  p_duration INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 시청 기록 추가 또는 업데이트
  INSERT INTO user_view_history (user_id, video_id, view_duration, viewed_at)
  VALUES (p_user_id, p_video_id, p_duration, NOW())
  ON CONFLICT (user_id, video_id)
  DO UPDATE SET
    viewed_at = NOW(),
    view_duration = COALESCE(p_duration, user_view_history.view_duration);

  -- 조회수 증가
  UPDATE video_content
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_video_id;
END;
$$;

-- 키워드 기반 추천 함수
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
  current_keywords TEXT[];
  current_tab TEXT;
BEGIN
  -- 현재 비디오의 키워드와 카테고리 가져오기
  SELECT v.keywords, v.tab
  INTO current_keywords, current_tab
  FROM video_content v
  WHERE v.id = p_video_id;

  -- 유사한 비디오 찾기
  RETURN QUERY
  WITH scored_videos AS (
    SELECT
      v.id,
      v.title,
      v.summary,
      v.keywords,
      v.tab,
      v.youtube_id,
      v.thumbnail,
      v.added_date,
      v.type,
      v.is_premium,
      v.image_url,
      -- 점수 계산
      (
        -- 같은 카테고리 점수
        CASE WHEN v.tab = current_tab THEN 30 ELSE 0 END +
        -- 키워드 매칭 점수
        (
          SELECT COUNT(*) * 15
          FROM unnest(v.keywords) AS keyword
          WHERE keyword = ANY(current_keywords)
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

-- 개인화 추천 함수
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
  -- 사용자가 본 비디오 ID들 가져오기
  SELECT ARRAY_AGG(video_id)
  INTO viewed_videos
  FROM (
    SELECT video_id
    FROM user_view_history
    WHERE user_id = p_user_id
    ORDER BY viewed_at DESC
    LIMIT 20
  ) recent_views;

  -- 선호 키워드 수집
  SELECT ARRAY_AGG(DISTINCT keyword)
  INTO preferred_keywords
  FROM (
    SELECT unnest(v.keywords) AS keyword
    FROM video_content v
    WHERE v.id = ANY(viewed_videos)
  ) keywords
  LIMIT 20;

  -- 선호 카테고리 수집
  SELECT ARRAY_AGG(DISTINCT v.tab)
  INTO preferred_tabs
  FROM video_content v
  WHERE v.id = ANY(viewed_videos);

  -- 추천 비디오 반환
  RETURN QUERY
  WITH scored_videos AS (
    SELECT
      v.id,
      v.title,
      v.summary,
      v.keywords,
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
        -- 선호 키워드 매칭
        (
          SELECT COUNT(*) * 10
          FROM unnest(v.keywords) AS keyword
          WHERE keyword = ANY(preferred_keywords)
        ) +
        -- 인기도
        COALESCE(LOG(v.view_count + 1) * 5, 0) +
        -- 최신성
        CASE WHEN v.added_date > NOW() - INTERVAL '7 days' THEN 15 ELSE 0 END
      )::FLOAT AS score
    FROM video_content v
    WHERE v.id NOT IN (SELECT unnest(viewed_videos))
  )
  SELECT * FROM scored_videos
  WHERE score > 0
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;

-- RLS 정책 설정
ALTER TABLE user_view_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 시청 기록만 볼 수 있음
CREATE POLICY "Users can view own history" ON user_view_history
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 시청 기록만 추가할 수 있음
CREATE POLICY "Users can insert own history" ON user_view_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 시청 기록만 업데이트할 수 있음
CREATE POLICY "Users can update own history" ON user_view_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_view_history_user_id ON user_view_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_view_history_video_id ON user_view_history(video_id);
CREATE INDEX IF NOT EXISTS idx_user_view_history_viewed_at ON user_view_history(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_content_view_count ON video_content(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_content_keywords ON video_content USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_video_content_tab ON video_content(tab);