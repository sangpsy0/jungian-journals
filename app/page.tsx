"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Play, Tag, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoModal } from "@/components/video-modal"
import { BlogModal } from "@/components/blog-modal"
import GoogleLoginButton from "@/components/google-login-button"
import { PremiumPayment } from "@/components/premium-payment"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface ContentItem {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  keywords: string[];
  youtubeId?: string;
  youtubeUrl?: string;
  thumbnail?: string;
  addedDate: string;
  tab: "Journals" | "Books" | "Fairy Tales" | "Blog by AI";
  type: "video" | "blog";
  isPremium?: boolean;
  content?: string;
  category?: string;
  image?: string;
}

type TabType = "Journals" | "Books" | "Fairy Tales" | "Blog by AI"

export default function HomePage() {
  const [videos, setVideos] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<ContentItem | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [selectedAlphabet, setSelectedAlphabet] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("Journals")
  const [showPayment, setShowPayment] = useState(false)
  const { user } = useAuth()

  // Supabase에서 콘텐츠 데이터 가져오기
  const fetchContent = async () => {
    try {
      setLoading(true)

      // 비디오 콘텐츠 가져오기
      const { data: videoData, error: videoError } = await supabase
        .from('video_content')
        .select('*')
        .order('created_at', { ascending: false })

      // 블로그 콘텐츠 가져오기
      const { data: blogData, error: blogError } = await supabase
        .from('blog_content')
        .select('*')
        .order('created_at', { ascending: false })

      if (videoError) {
        console.error('비디오 데이터 로드 오류:', videoError)
      }

      if (blogError) {
        console.error('블로그 데이터 로드 오류:', blogError)
      }

      // 📊 데이터베이스 원본 키워드 상태 확인
      console.log('📊 데이터베이스에서 로드된 원본 데이터:');
      if (videoData && videoData.length > 0) {
        videoData.slice(0, 3).forEach((video, index) => {
          console.log(`${index + 1}. ${video.title}:`, {
            keywords: video.keywords,
            keywordType: typeof video.keywords,
            isNull: video.keywords === null,
            isUndefined: video.keywords === undefined,
            rawValue: JSON.stringify(video.keywords)
          });
        });
      }

      const formattedVideos: ContentItem[] = (videoData || []).map(video => {
        console.log('비디오 원본 데이터:', video);
        console.log('비디오 키워드 타입:', typeof video.keywords, video.keywords);

        // 키워드가 문자열인 경우 배열로 변환
        let processedKeywords = [];
        if (video.keywords) {
          if (typeof video.keywords === 'string') {
            try {
              // JSON 문자열인 경우 파싱
              const parsed = JSON.parse(video.keywords);
              processedKeywords = Array.isArray(parsed) ? parsed : [];
            } catch {
              // 쉼표로 구분된 문자열인 경우 분할
              processedKeywords = video.keywords.split(',').map((k: any) => k.trim()).filter((k: any) => k);
            }
          } else if (Array.isArray(video.keywords)) {
            processedKeywords = video.keywords;
          }
        }

        // 키워드가 비어있으면 빈 배열로 설정
        if (!processedKeywords || !Array.isArray(processedKeywords)) {
          processedKeywords = [];
        }

        // 테스트 키워드 제거됨

        console.log('🔍 키워드 디버깅:', {
          title: video.title,
          rawKeywords: video.keywords,
          keywordType: typeof video.keywords,
          processedKeywords,
          processedLength: processedKeywords.length
        });

        return {
          id: video.id,
          title: video.title,
          summary: video.description || '',
          keywords: processedKeywords,
          youtubeId: video.youtube_url ? extractYouTubeId(video.youtube_url) : undefined,
          youtubeUrl: video.youtube_url,
          thumbnail: video.youtube_url ? `https://img.youtube.com/vi/${extractYouTubeId(video.youtube_url)}/maxresdefault.jpg` : "/placeholder.svg",
          addedDate: video.created_at,
          tab: video.category as TabType,
          type: "video" as const,
          isPremium: video.is_premium || false,
        };
      })

      const formattedBlogs: ContentItem[] = (blogData || []).map(blog => {
        console.log('블로그 원본 데이터:', blog);
        console.log('블로그 키워드 타입:', typeof blog.keywords, blog.keywords);

        // 키워드가 문자열인 경우 배열로 변환
        let processedKeywords = [];
        if (blog.keywords) {
          if (typeof blog.keywords === 'string') {
            try {
              // JSON 문자열인 경우 파싱
              const parsed = JSON.parse(blog.keywords);
              processedKeywords = Array.isArray(parsed) ? parsed : [];
            } catch {
              // 쉼표로 구분된 문자열인 경우 분할
              processedKeywords = blog.keywords.split(',').map((k: any) => k.trim()).filter((k: any) => k);
            }
          } else if (Array.isArray(blog.keywords)) {
            processedKeywords = blog.keywords;
          }
        }

        // 키워드가 비어있으면 빈 배열로 설정
        if (!processedKeywords || !Array.isArray(processedKeywords)) {
          processedKeywords = [];
        }

        console.log('처리된 블로그 키워드:', processedKeywords);

        return {
          id: blog.id,
          title: blog.title,
          summary: blog.content?.substring(0, 150) + '...' || '',
          keywords: processedKeywords,
          thumbnail: blog.image || "/placeholder.svg",
          addedDate: blog.created_at,
          tab: "Blog by AI" as TabType,
          type: "blog" as const,
          isPremium: blog.is_premium || false,
          content: blog.content,
        };
      })

      setVideos([...formattedVideos, ...formattedBlogs])
    } catch (error) {
      console.error('데이터 로드 중 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // YouTube URL에서 Video ID 추출하는 함수
  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : ''
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesTab = video.tab === activeTab

      const matchesSearch =
        searchTerm === "" ||
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.summary && video.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        video.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesKeyword = !selectedKeyword || video.keywords.includes(selectedKeyword)

      return matchesTab && matchesSearch && matchesKeyword
    })
  }, [videos, searchTerm, selectedKeyword, activeTab])

  const keywordsByAlphabet = useMemo(() => {
    const currentTabVideos = videos.filter((video) => video.tab === activeTab)
    const allKeywords = currentTabVideos.flatMap((video) => video.keywords)
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
  }, [videos, activeTab])

  const handleAlphabetClick = (letter: string) => {
    setSelectedAlphabet(selectedAlphabet === letter ? null : letter)
    setSelectedKeyword(null)
  }


  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword(keyword === selectedKeyword ? null : keyword)
  }



  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedKeyword(null)
    setSelectedAlphabet(null)
  }

  const handleHomeClick = () => {
    setActiveTab("Journals")
    setSelectedKeyword(null)
    setSelectedAlphabet(null)
    setSearchTerm("")
  }

  const handleUpgradeToPremium = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowPayment(true);
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    // 페이지 새로고침으로 사용자 상태 업데이트
    window.location.reload();
  }

  const canReadBlogContent = user?.user_metadata?.isPremium || false

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleHomeClick}
                className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                Jungian Journals
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <img src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.user_metadata?.full_name || "User"} className="w-8 h-8 rounded-full" />
                  <div className="hidden md:block">
                    <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</span>
                  </div>
                </div>
              )}
              <GoogleLoginButton />
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              {(["Journals", "Books", "Fairy Tales", "Blog by AI"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {tab}
                    <Badge variant="secondary" className="text-xs">
                      {videos.filter((video) => video.tab === tab).length}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {activeTab === "Blog by AI" && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Blog by AI</h2>
              <p className="text-xl text-gray-700 mb-8">
                AI is far smarter than us. Don't worry. This blog writes perfectly evidence-based articles without any
                hallucinations.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="flex">
        <aside className="w-64 border-r bg-muted/30 min-h-screen sticky top-32">
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
                  const videoCount = videos.filter(
                    (video) => video.tab === activeTab && video.keywords.includes(keyword),
                  ).length
                  return (
                    <Button
                      key={keyword}
                      variant={selectedKeyword === keyword ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs h-7"
                      onClick={() => setSelectedKeyword(keyword === selectedKeyword ? null : keyword)}
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
          </div>
        </aside>

        <div className="flex-1">
          <section className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={
                    activeTab === "Blog by AI"
                      ? "Search blog title, content, keywords..."
                      : "Search video title, description, keywords..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {filteredVideos.length} {activeTab === "Blog by AI" ? "articles" : "videos"} in {activeTab}
                {searchTerm && ` for "${searchTerm}"`}
                {selectedKeyword && ` - "${selectedKeyword}" keyword`}
              </p>
            </div>
          </section>

          <main className="container mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <ContentCard
                  key={video.id}
                  video={video}
                  onPlay={() => {
                    if (video.type === "blog") {
                      setSelectedBlog(video)
                    } else {
                      setSelectedVideo(video)
                    }
                  }}
                  onKeywordClick={handleKeywordClick}
                />
              ))}
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            )}

            {!loading && filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {videos.length === 0
                    ? `No content available in ${activeTab} yet.`
                    : "No search results found."
                  }
                </p>
                <p className="text-muted-foreground">
                  {videos.length === 0
                    ? "Content will appear here once added by admin."
                    : "Try searching with different keywords."
                  }
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedVideo && (
        <VideoModal video={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          isOpen={!!selectedBlog}
          onClose={() => setSelectedBlog(null)}
          canReadContent={canReadBlogContent}
          onUpgrade={handleUpgradeToPremium}
        />
      )}

      {showPayment && (
        <PremiumPayment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Hidden Admin Link */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <p>© 2024 Jungian Journals. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>v1.0.0</span>
              <a
                href="/jjr"
                className="hover:text-foreground transition-colors"
                style={{ fontSize: '10px', opacity: 0.3 }}
              >
                •
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ContentCard({
  video,
  onPlay,
  onKeywordClick,
}: {
  video: ContentItem
  onPlay: () => void
  onKeywordClick: (keyword: string) => void
}) {
  const isBlog = video.type === "blog"
  const isPremium = 'isPremium' in video && video.isPremium;

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <div className="relative overflow-hidden rounded-t-lg cursor-pointer" onClick={onPlay}>
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          {isBlog ? (
            <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-sm font-medium text-gray-800">Read</span>
            </div>
          ) : (
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}
        </div>
        {isBlog && (
          <>
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-600">AI Blog</Badge>
            {isPremium && (
              <Badge className="absolute top-2 left-2 bg-amber-500 text-white">프리미엄</Badge>
            )}
          </>
        )}
      </div>
      <CardHeader className="pb-2" onClick={onPlay}>
        <CardTitle className="text-lg line-clamp-2 text-balance cursor-pointer">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-pretty cursor-pointer">{video.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {(() => {
            console.log('🎨 ContentCard 키워드 렌더링:', {
              title: video.title,
              keywords: video.keywords,
              keywordsLength: video.keywords?.length,
              hasKeywords: video.keywords && video.keywords.length > 0
            });
            return video.keywords && video.keywords.length > 0 ? (
              video.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onKeywordClick(keyword)
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">키워드 없음</div>
            );
          })()}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground" onClick={onPlay}>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(video.addedDate).toLocaleDateString("en-US")}
          </div>
          {isBlog && (
            <div>
              {isPremium ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                  <Star className="h-2 w-2 mr-1" />
                  유료 회원용
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  무료
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
