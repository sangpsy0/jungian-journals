'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth-provider';
import { getRecommendations, getPersonalizedRecommendations } from '@/lib/recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  summary: string;
  keywords: string[] | string;
  category?: string;
  tab?: string;
  youtube_id?: string;
  youtubeId?: string;
  thumbnail: string;
  created_at?: string;
  added_date?: string;
  addedDate?: string;
  type: string;
  is_premium?: boolean;
  isPremium?: boolean;
  image_url?: string;
  view_count?: number;
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

interface VideoRecommendationsProps {
  currentVideoId: string;
  onVideoSelect: (video: Video) => void;
}

export function VideoRecommendations({
  currentVideoId,
  onVideoSelect
}: VideoRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        let videos: Video[] = [];

        if (user) {
          // 로그인한 사용자: 개인화된 추천
          videos = await getPersonalizedRecommendations(user.id, 6);

          // 개인화 추천이 부족하면 일반 추천으로 보충
          if (videos.length < 6) {
            const generalRecs = await getRecommendations(currentVideoId, undefined, 6 - videos.length);
            videos = [...videos, ...generalRecs];
          }
        } else {
          // 비로그인 사용자: 키워드 기반 추천
          videos = await getRecommendations(currentVideoId, undefined, 6);
        }

        setRecommendations(videos);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentVideoId, user]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">추천 콘텐츠</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {user ? '맞춤 추천 콘텐츠' : '관련 콘텐츠'}
        </h3>
        {user && (
          <Badge variant="secondary" className="text-xs">
            AI 추천
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => onVideoSelect(video)}
          >
            <div className="relative aspect-video bg-muted">
              {video.image_url || video.thumbnail ? (
                <Image
                  src={video.image_url || video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                  <Play className="h-12 w-12 text-primary/40" />
                </div>
              )}

              {(video.is_premium || video.isPremium) && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-500 text-white gap-1">
                    <Lock className="h-3 w-3" />
                    프리미엄
                  </Badge>
                </div>
              )}

              <div className="absolute bottom-2 left-2">
                <Badge className="bg-background/90 text-foreground">
                  {video.category || video.tab || '일반'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <h4 className="font-medium line-clamp-2 mb-2">
                {video.title}
              </h4>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {video.summary}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(video.created_at || video.added_date || video.addedDate || Date.now()).toLocaleDateString('ko-KR')}
                </div>

                <div className="flex gap-1">
                  {parseKeywords(video.keywords).slice(0, 2).map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                      {keyword}
                    </Badge>
                  ))}
                  {parseKeywords(video.keywords).length > 2 && (
                    <span className="text-xs">+{parseKeywords(video.keywords).length - 2}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!user && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            로그인하면 맞춤 AI 추천을 받을 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}