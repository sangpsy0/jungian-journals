'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth-provider';
import { getRecommendations, getPersonalizedRecommendations } from '@/lib/recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Lock, Tag, Star, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  currentVideo?: Video;
  onVideoSelect: (video: Video) => void;
}

export function VideoRecommendations({
  currentVideoId,
  currentVideo,
  onVideoSelect
}: VideoRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      // Only fetch recommendations if user is logged in
      if (!user) {
        setLoading(false);
        setRecommendations([]);
        return;
      }

      setLoading(true);
      try {
        let videos: Video[] = [];

        // 로그인한 사용자: 개인화된 추천
        videos = await getPersonalizedRecommendations(user.id, 6);

        // 개인화 추천이 부족하면 일반 추천으로 보충
        if (videos.length < 6) {
          const generalRecs = await getRecommendations(currentVideoId, undefined, 6 - videos.length);
          videos = [...videos, ...generalRecs];
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

  // For non-logged users, only show the sign-in prompt
  if (!user) {
    return (
      <div className="mt-8 border-t pt-8">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to get personalized AI recommendations
          </p>
        </div>
      </div>
    );
  }

  // Loading state for logged-in users
  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recommended Content</h3>
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
          {user ? 'Personalized Recommendations' : 'Related Content'}
        </h3>
        {user && (
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
        )}
      </div>

      <TooltipProvider>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((video) => {
            const isPremium = video.is_premium || video.isPremium;
            const keywords = parseKeywords(video.keywords);

            // Generate recommendation reason
            const getRecommendationReason = () => {
              const reasons = [];
              if (video.category === currentVideo?.category || video.tab === currentVideo?.tab) {
                reasons.push(`Same category: ${video.category || video.tab}`);
              }
              const sharedKeywords = keywords.filter(k =>
                parseKeywords(currentVideo?.keywords || []).includes(k)
              );
              if (sharedKeywords.length > 0) {
                reasons.push(`Shared keywords: ${sharedKeywords.slice(0, 3).join(', ')}`);
              }
              if (video.view_count && video.view_count > 10) {
                reasons.push(`Popular content (${video.view_count} views)`);
              }
              const daysSinceAdded = Math.floor((Date.now() - new Date(video.created_at || video.added_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
              if (daysSinceAdded <= 7) {
                reasons.push('Recently added');
              }
              return reasons.length > 0 ? reasons.join(' • ') : 'Related content based on AI analysis';
            };

            return (
              <Card key={video.id} className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="relative overflow-hidden rounded-t-lg" onClick={() => onVideoSelect(video)}>
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  {isPremium && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 text-white">Premium</Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-2 right-2">
                        <Info className="h-5 w-5 text-white bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-3 space-y-2">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{video.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {video.summary || video.description || 'No description available'}
                        </p>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-xs italic text-muted-foreground">
                          💡 Why recommended: {getRecommendationReason()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardHeader className="pb-2" onClick={() => onVideoSelect(video)}>
                  <CardTitle className="text-lg line-clamp-2 text-balance">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-pretty">
                    {video.summary || video.description || ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0" onClick={() => onVideoSelect(video)}>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {keywords.slice(0, 3).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                    {keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(video.created_at || video.added_date || video.addedDate || Date.now()).toLocaleDateString("en-US")}
                    </div>
                    {isPremium ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                        <Star className="h-2 w-2 mr-1" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Free
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}