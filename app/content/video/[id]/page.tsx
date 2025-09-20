"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface VideoContent {
  id: string
  title: string
  description: string
  youtube_url: string
  category: string
  keywords: string[]
  created_at: string
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<VideoContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('video_content')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Parse keywords
        let processedKeywords = []
        if (data.keywords) {
          if (typeof data.keywords === 'string') {
            try {
              processedKeywords = JSON.parse(data.keywords)
            } catch {
              processedKeywords = data.keywords.split(',').map(k => k.trim()).filter(k => k)
            }
          } else if (Array.isArray(data.keywords)) {
            processedKeywords = data.keywords
          }
        }

        setVideo({
          ...data,
          keywords: processedKeywords
        })
      } catch (error) {
        console.error('Error fetching video:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVideo()
    }
  }, [params.id])

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">비디오를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">요청하신 비디오가 존재하지 않거나 삭제되었습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  const youtubeId = extractYouTubeId(video.youtube_url)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>홈으로</span>
            </Button>
            <div className="text-sm text-muted-foreground">
              {video.category}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Video Title and Meta */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(video.created_at).toLocaleDateString("ko-KR")}
              </div>
              <Badge variant="outline">{video.category}</Badge>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-6">
              {video.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* YouTube Video Player */}
          <div className="aspect-video mb-8 rounded-lg overflow-hidden bg-black">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mb-4 mx-auto opacity-50" />
                  <p>비디오를 재생할 수 없습니다</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Description */}
          {video.description && (
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-semibold mb-4">설명</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}