"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Play, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { VideoRecommendations } from "@/components/video-recommendations"
import { useAuth } from "@/components/auth-provider"
import GoogleLoginButton from "@/components/google-login-button"

interface VideoContent {
  id: string
  title: string
  summary?: string
  description?: string
  youtube_url?: string
  youtubeId?: string
  youtube_id?: string
  category: string
  tab?: string
  keywords: string[] | string
  created_at: string
  added_date?: string
  addedDate?: string
  type?: string
  is_premium?: boolean
  isPremium?: boolean
  image_url?: string
  thumbnail?: string
  view_count?: number
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [video, setVideo] = useState<VideoContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [allVideos, setAllVideos] = useState<VideoContent[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [selectedAlphabet, setSelectedAlphabet] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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
          keywords: processedKeywords,
          type: 'video'
        })

        // 로그인한 사용자라면 시청 기록 저장
        if (user?.id) {
          await supabase.rpc('record_video_view', {
            p_user_id: user.id,
            p_video_id: data.id
          }).catch(err => console.log('시청 기록 저장 실패:', err))
        }
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

  // 모든 비디오 가져오기 (키워드 목록 생성용)
  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('video_content')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const processedVideos = data.map(v => {
          let keywords = []
          if (v.keywords) {
            if (typeof v.keywords === 'string') {
              try {
                keywords = JSON.parse(v.keywords)
              } catch {
                keywords = v.keywords.split(',').map(k => k.trim()).filter(k => k)
              }
            } else if (Array.isArray(v.keywords)) {
              keywords = v.keywords
            }
          }
          return { ...v, keywords, type: 'video' as const }
        })

        setAllVideos(processedVideos)
      } catch (error) {
        console.error('Error fetching all videos:', error)
      }
    }

    fetchAllVideos()
  }, [])

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : ''
  }

  // 알파벳별로 키워드 그룹화
  const keywordsByAlphabet = useMemo(() => {
    const allKeywords = allVideos.flatMap((v) => v.keywords)
    const uniqueKeywords = Array.from(new Set(allKeywords))
    const englishKeywords = uniqueKeywords.filter((keyword) => /^[a-zA-Z0-9\s\-_]+$/.test(keyword)).sort()

    const alphabetGroups: Record<string, string[]> = {}

    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i)
      alphabetGroups[letter] = []
    }

    englishKeywords.forEach((keyword) => {
      const firstLetter = keyword.charAt(0).toUpperCase()
      if (alphabetGroups[firstLetter]) {
        alphabetGroups[firstLetter].push(keyword)
      }
    })

    return alphabetGroups
  }, [allVideos])

  const handleAlphabetClick = (letter: string) => {
    setSelectedAlphabet(selectedAlphabet === letter ? null : letter)
    setSelectedKeyword(null)
  }

  const handleKeywordSearch = (keyword: string) => {
    // 키워드 검색 시 홈페이지로 이동하며 키워드 파라미터 전달
    router.push(`/?keyword=${encodeURIComponent(keyword)}`)
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

  const youtubeId = video.youtube_id || video.youtubeId || (video.youtube_url ? extractYouTubeId(video.youtube_url) : '')

  const handleVideoSelect = (newVideo: VideoContent) => {
    router.push(`/content/video/${newVideo.id}`)
  }

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
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {video.category}
              </div>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user.user_metadata?.full_name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="hidden md:block">
                      <span className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                  </div>
                )}
                <GoogleLoginButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Keyword Sidebar */}
        <aside className="w-64 border-r bg-muted/30 min-h-screen sticky top-16">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">Keywords</h3>

            <Button
              variant={selectedKeyword === null ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start mb-4"
              onClick={() => {
                setSelectedKeyword(null)
                setSelectedAlphabet(null)
              }}
            >
              All Keywords
            </Button>

            <div className="grid grid-cols-4 gap-1 mb-4">
              {Object.entries(keywordsByAlphabet).map(([letter, keywords]) => (
                <Button
                  key={letter}
                  variant={selectedAlphabet === letter ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 text-xs font-medium ${keywords.length === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                  onClick={() => keywords.length > 0 && handleAlphabetClick(letter)}
                  disabled={keywords.length === 0}
                >
                  {letter}
                </Button>
              ))}
            </div>

            {selectedAlphabet && keywordsByAlphabet[selectedAlphabet].length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">{selectedAlphabet} Keywords</div>
                {keywordsByAlphabet[selectedAlphabet].map((keyword) => {
                  const videoCount = allVideos.filter(
                    (v) => v.keywords.includes(keyword),
                  ).length
                  return (
                    <Button
                      key={keyword}
                      variant={selectedKeyword === keyword ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs h-7"
                      onClick={() => handleKeywordSearch(keyword)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {videoCount}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            )}

            {/* Current Video Keywords */}
            {video.keywords && video.keywords.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="text-xs font-medium text-muted-foreground mb-2">이 영상의 키워드</div>
                <div className="space-y-1">
                  {(Array.isArray(video.keywords) ? video.keywords : []).map((keyword) => (
                    <Button
                      key={keyword}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-7"
                      onClick={() => handleKeywordSearch(keyword)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
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
              {(Array.isArray(video.keywords) ? video.keywords : []).map((keyword) => (
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
            <div className="prose prose-gray max-w-none mb-12">
              <h2 className="text-xl font-semibold mb-4">설명</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

              {/* 추천 콘텐츠 섹션 */}
              <VideoRecommendations
                currentVideoId={video.id}
                currentVideo={video}
                onVideoSelect={handleVideoSelect}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}