"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag } from "lucide-react"
import PremiumContent from "@/components/premium-content"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Video {
  id: string
  title: string
  summary: string
  keywords: string[]
  tab: string
  youtubeId?: string
  thumbnail: string
  addedDate: string
  type: string
  isPremium?: boolean
  content?: string
}

interface VideoModalProps {
  video: Video
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const router = useRouter()
  const isPremium = video.isPremium || false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-balance">
            {video.title}
            {isPremium && (
              <Badge className="ml-2 bg-amber-500 text-white">프리미엄</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 유튜브 임베드 - 프리미엄 콘텐츠인 경우 제한 */}
          {video.type === "video" && video.youtubeId && (
            isPremium ? (
              <PremiumContent>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </PremiumContent>
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
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
              <Badge className="bg-primary text-primary-foreground">{video.tab}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(video.addedDate).toLocaleDateString("ko-KR")}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">요약</h3>
              <p className="text-muted-foreground text-pretty">{video.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">키워드</h3>
              <div className="flex flex-wrap gap-2">
                {video.keywords.map((keyword) => (
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
