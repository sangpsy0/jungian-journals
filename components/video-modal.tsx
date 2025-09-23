"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag } from "lucide-react"
import PremiumContent from "@/components/premium-content"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { VideoRecommendations } from "./video-recommendations"
import { useAuth } from "./auth-provider"
import { useState, useEffect } from "react"

interface Video {
  id: string
  title: string
  summary: string
  keywords: string[] | string
  category?: string
  tab?: string
  youtube_id?: string
  youtubeId?: string
  thumbnail: string
  created_at?: string
  added_date?: string
  addedDate?: string
  type: string
  is_premium?: boolean
  isPremium?: boolean
  content?: string
  image_url?: string
  view_count?: number
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

interface VideoModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentVideo, setCurrentVideo] = useState(video)
  const isPremium = currentVideo.is_premium || currentVideo.isPremium || false
  const youtubeId = currentVideo.youtube_id || currentVideo.youtubeId

  useEffect(() => {
    setCurrentVideo(video)
  }, [video])

  const handleVideoSelect = (newVideo: Video) => {
    setCurrentVideo(newVideo)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-balance">
            {currentVideo.title}
            {isPremium && (
              <Badge className="ml-2 bg-amber-500 text-white">프리미엄</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 유튜브 임베드 - 프리미엄 콘텐츠인 경우 제한 */}
          {currentVideo.type === "video" && youtubeId && (
            isPremium ? (
              <PremiumContent>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={currentVideo.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </PremiumContent>
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={currentVideo.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )
          )}

          {/* 비디오 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                {currentVideo.category || currentVideo.tab || '일반'}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(currentVideo.created_at || currentVideo.added_date || currentVideo.addedDate || Date.now()).toLocaleDateString("ko-KR")}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">요약</h3>
              <p className="text-muted-foreground text-pretty">{currentVideo.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">키워드</h3>
              <div className="flex flex-wrap gap-2">
                {parseKeywords(currentVideo.keywords).map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {isPremium && (
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={() => router.push('/subscription')}
                >
                  프리미엄 멤버십 가입하기
                </Button>
              </div>
            )}
          </div>

          {/* 추천 콘텐츠 섹션 - 로그인한 사용자에게만 표시 */}
          <VideoRecommendations
            currentVideoId={currentVideo.id}
            currentVideo={currentVideo}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
