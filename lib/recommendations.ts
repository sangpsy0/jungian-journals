import { supabase } from './supabase';

// 비디오 타입 정의
interface Video {
  id: string;
  title: string;
  summary: string;
  keywords: string[] | string; // JSON 문자열 또는 배열
  category?: string; // tab 대신 category 사용
  tab?: string; // 하위 호환성을 위해 유지
  youtube_id?: string;
  youtubeId?: string; // 하위 호환성
  youtube_url?: string; // YouTube URL 추가
  thumbnail?: string;  // Optional로 변경
  created_at?: string;  // Supabase 기본 타임스탬프
  added_date?: string;  // 커스텀 필드 (있을 경우)
  addedDate?: string;   // 하위 호환성
  type: string;
  is_premium?: boolean;
  isPremium?: boolean; // 하위 호환성
  content?: string;
  image_url?: string;
  view_count?: number;
  description?: string; // 설명 필드 추가
}

// YouTube URL에서 Video ID 추출하는 함수
function extractYouTubeId(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : ''
}

// YouTube 썸네일 URL 생성 헬퍼 함수 (홈화면과 동일하게)
function getYouTubeThumbnail(video: Video): string {
  // 업로드된 이미지 우선
  if (video.image_url) {
    return video.image_url;
  }

  // YouTube URL에서 ID 추출하여 썸네일 생성
  if (video.youtube_url) {
    const youtubeId = extractYouTubeId(video.youtube_url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
  }

  // youtube_id 필드 확인 (fallback)
  const youtubeId = video.youtube_id || video.youtubeId;
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }

  return video.thumbnail || '/placeholder.svg';
}

// keywords를 배열로 변환하는 헬퍼 함수
function parseKeywords(keywords: string[] | string): string[] {
  if (Array.isArray(keywords)) {
    return keywords;
  }
  try {
    return JSON.parse(keywords);
  } catch {
    return [];
  }
}

// 추천 점수 계산 (키워드 + 카테고리 기반)
function calculateRecommendationScore(
  currentVideo: Video,
  candidateVideo: Video
): number {
  let score = 0;

  // 1. 같은 카테고리인 경우 높은 점수
  const currentCategory = currentVideo.category || currentVideo.tab;
  const candidateCategory = candidateVideo.category || candidateVideo.tab;

  if (currentCategory && candidateCategory && currentCategory === candidateCategory) {
    score += 30;
  }

  // 2. 키워드 매칭 점수
  const currentKeywords = new Set(parseKeywords(currentVideo.keywords).map(k => k.toLowerCase()));
  const candidateKeywords = new Set(parseKeywords(candidateVideo.keywords).map(k => k.toLowerCase()));

  let matchedKeywords = 0;
  currentKeywords.forEach(keyword => {
    if (candidateKeywords.has(keyword)) {
      matchedKeywords++;
    }
  });

  // 매칭된 키워드 수에 따라 점수 부여 (최대 50점)
  score += Math.min(matchedKeywords * 15, 50);

  // 3. 제목 유사도 (간단한 단어 매칭)
  const currentTitleWords = new Set(
    currentVideo.title.toLowerCase().split(/\s+/)
      .filter(word => word.length > 2)
  );
  const candidateTitleWords = new Set(
    candidateVideo.title.toLowerCase().split(/\s+/)
      .filter(word => word.length > 2)
  );

  let matchedTitleWords = 0;
  currentTitleWords.forEach(word => {
    if (candidateTitleWords.has(word)) {
      matchedTitleWords++;
    }
  });

  score += matchedTitleWords * 5;

  // 4. 최신 콘텐츠 가산점 (7일 이내)
  const dateField = candidateVideo.created_at || candidateVideo.added_date || candidateVideo.addedDate;
  if (dateField) {
    const candidateDate = new Date(dateField);
    const daysDiff = Math.floor((Date.now() - candidateDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      score += 10;
    }
  }

  // 5. 조회수 가산점
  if (candidateVideo.view_count) {
    score += Math.min(Math.log(candidateVideo.view_count + 1) * 5, 20);
  }

  return score;
}

// 키워드 기반 추천 (Fallback)
export async function getKeywordBasedRecommendations(
  currentVideoId: string,
  limit: number = 5
): Promise<Video[]> {
  try {
    // 현재 비디오 정보 가져오기
    const { data: currentVideo, error: currentError } = await supabase
      .from('video_content')
      .select('*')
      .eq('id', currentVideoId)
      .single();

    if (currentError || !currentVideo) {
      console.error('Error fetching current video:', currentError);
      return [];
    }

    // 모든 비디오 가져오기 (현재 비디오 제외)
    const { data: allVideos, error: allError } = await supabase
      .from('video_content')
      .select('*')
      .neq('id', currentVideoId)
      .limit(50); // 성능을 위해 최대 50개만

    if (allError || !allVideos) {
      console.error('Error fetching videos:', allError);
      return [];
    }

    // 각 비디오에 대해 추천 점수 계산
    const scoredVideos = allVideos.map(video => ({
      ...video,
      keywords: parseKeywords(video.keywords), // keywords를 배열로 변환
      thumbnail: getYouTubeThumbnail(video), // 썸네일 URL 생성
      score: calculateRecommendationScore(currentVideo, video)
    }));

    // 점수순으로 정렬하고 상위 N개 반환
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...video }) => video);
  } catch (error) {
    console.error('Error in keyword-based recommendations:', error);
    return [];
  }
}

// 벡터 기반 추천 (Supabase pgvector 사용)
export async function getVectorBasedRecommendations(
  currentVideoId: string,
  embedding: number[],
  limit: number = 5
): Promise<Video[]> {
  try {
    // Supabase RPC 함수 호출 (match_videos)
    const { data, error } = await supabase.rpc('match_videos', {
      query_embedding: embedding,
      match_count: limit,
      current_video_id: currentVideoId
    });

    if (error) {
      console.error('Vector search error:', error);
      // 오류 시 키워드 기반 추천으로 폴백
      return getKeywordBasedRecommendations(currentVideoId, limit);
    }

    return data || [];
  } catch (error) {
    console.error('Error in vector-based recommendations:', error);
    // 오류 시 키워드 기반 추천으로 폴백
    return getKeywordBasedRecommendations(currentVideoId, limit);
  }
}

// 하이브리드 추천 시스템 (메인 함수)
export async function getRecommendations(
  currentVideoId: string,
  embedding?: number[],
  limit: number = 5
): Promise<Video[]> {
  // 임베딩이 있으면 벡터 기반 추천 시도
  if (embedding && embedding.length > 0) {
    const vectorRecommendations = await getVectorBasedRecommendations(
      currentVideoId,
      embedding,
      limit
    );

    if (vectorRecommendations.length > 0) {
      return vectorRecommendations;
    }
  }

  // 벡터 추천이 실패하거나 임베딩이 없으면 키워드 기반 추천
  return getKeywordBasedRecommendations(currentVideoId, limit);
}

// 사용자 시청 기록 기반 개인화 추천
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 5
): Promise<Video[]> {
  try {
    // 사용자의 최근 시청 기록 가져오기
    const { data: viewHistory, error: historyError } = await supabase
      .from('user_view_history')
      .select('video_id')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(10);

    if (historyError || !viewHistory || viewHistory.length === 0) {
      // 시청 기록이 없으면 인기 콘텐츠 반환
      const { data: popularVideos, error: popularError } = await supabase
        .from('video_content')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (popularVideos) {
        return popularVideos.map(video => ({
          ...video,
          keywords: parseKeywords(video.keywords),
          thumbnail: getYouTubeThumbnail(video)
        }));
      }
      return [];
    }

    // 시청한 비디오들의 키워드와 카테고리 수집
    const viewedVideoIds = viewHistory.map(h => h.video_id);
    const { data: viewedVideos, error: videosError } = await supabase
      .from('video_content')
      .select('keywords, category')
      .in('id', viewedVideoIds);

    if (videosError || !viewedVideos) {
      return [];
    }

    // 선호 키워드와 카테고리 집계
    const keywordCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    viewedVideos.forEach(video => {
      const keywords = parseKeywords(video.keywords);
      keywords.forEach((keyword: string) => {
        keywordCounts[keyword.toLowerCase()] = (keywordCounts[keyword.toLowerCase()] || 0) + 1;
      });
      if (video.category) {
        categoryCounts[video.category] = (categoryCounts[video.category] || 0) + 1;
      }
    });

    // 가장 많이 본 카테고리와 키워드 기반으로 추천
    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    const topKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    // 추천 쿼리 구성
    const { data: recommendations, error: recError } = await supabase
      .from('video_content')
      .select('*')
      .not('id', 'in', `(${viewedVideoIds.join(',')})`)
      .or(`category.in.(${topCategories.join(',')}),keywords.cs.{${topKeywords.join(',')}}`)
      .limit(limit * 2);

    if (recError || !recommendations) {
      return [];
    }

    // 점수 계산 및 정렬
    const scoredRecommendations = recommendations.map(video => {
      let score = 0;

      // 선호 카테고리 매칭
      if (topCategories.includes(video.category)) {
        score += 30 * (categoryCounts[video.category] || 0);
      }

      // 선호 키워드 매칭
      const keywords = parseKeywords(video.keywords);
      keywords.forEach((keyword: string) => {
        const lowerKeyword = keyword.toLowerCase();
        if (keywordCounts[lowerKeyword]) {
          score += 10 * keywordCounts[lowerKeyword];
        }
      });

      return {
        ...video,
        keywords,
        thumbnail: getYouTubeThumbnail(video),
        score
      };
    });

    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...video }) => video);
  } catch (error) {
    console.error('Error in personalized recommendations:', error);
    return [];
  }
}