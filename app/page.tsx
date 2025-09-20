"use client"

import { useState, useMemo } from "react"
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

const sampleVideos = [
  {
    id: "1",
    title: "Complete Next.js 14 Guide",
    summary: "Learn about Next.js 14's new features and App Router usage in detail",
    keywords: ["NextJS", "React", "WebDev", "JavaScript"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/nextjs-tutorial-thumbnail.jpg",
    addedDate: "2024-01-15",
    tab: "Journals" as const,
    type: "video" as const,
  },
  {
    id: "2",
    title: "Mastering React Hooks",
    summary: "Complete guide from useState, useEffect to custom hooks",
    keywords: ["React", "Hooks", "useState", "useEffect"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/react-hooks-tutorial.png",
    addedDate: "2024-01-10",
    tab: "Books" as const,
    type: "video" as const,
  },
  {
    id: "3",
    title: "Building Design Systems",
    summary: "Creating design systems with Figma and Storybook",
    keywords: ["DesignSystem", "Figma", "Storybook", "UIUX"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/design-system-figma.jpg",
    addedDate: "2024-01-12",
    tab: "Fairy Tales" as const,
    type: "video" as const,
    isPremium: true,
  },
  {
    id: "4",
    title: "Advanced TypeScript Patterns",
    summary: "Generics, utility types, conditional types and advanced TypeScript patterns",
    keywords: ["TypeScript", "Generics", "Types", "AdvancedPatterns"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/typescript-advanced-patterns.jpg",
    addedDate: "2024-01-08",
    tab: "Journals" as const,
    type: "video" as const,
  },
  {
    id: "5",
    title: "UX Research Methodology",
    summary: "User interviews, surveys, A/B testing and other UX research techniques",
    keywords: ["UXResearch", "UserInterview", "ABTesting", "UX"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/ux-research-methods.png",
    addedDate: "2024-01-05",
    tab: "Books" as const,
    type: "video" as const,
  },
  {
    id: "6",
    title: "Marketing Automation Strategy",
    summary: "Maximizing efficiency with email marketing and social media automation",
    keywords: ["MarketingAutomation", "EmailMarketing", "SocialMedia", "Marketing"],
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "/marketing-automation-strategy.jpg",
    addedDate: "2024-01-03",
    tab: "Fairy Tales" as const,
    type: "video" as const,
  },
  {
    id: "blog1",
    title: "AI-Analyzed Human Psychology Patterns",
    summary: "Unconscious behavioral patterns and their meanings analyzed by latest AI technology",
    keywords: ["AI", "Psychology", "PatternAnalysis", "Unconscious"],
    thumbnail: "/ai-psychology-analysis.jpg",
    addedDate: "2024-01-20",
    tab: "Blog by AI" as const,
    type: "blog" as const,
    isPremium: true,
    content: `# AI-Analyzed Human Psychology Patterns

Let's explore the hidden patterns of human psychology discovered by artificial intelligence through massive data analysis.

## Key Findings

1. **Cyclical Nature of Emotional Expression**: Human emotional expression follows a 7-day cycle pattern.
2. **Time-based Decision Making Characteristics**: Most rational judgments are made at 10 AM and 3 PM.
3. **Regularity of Social Interactions**: Conversation patterns based on intimacy levels are mathematically predictable.

These patterns can provide practical help for personal growth and improving human relationships.`,
  },
  {
    id: "blog2",
    title: "Future of Education: The AI Tutor Era",
    summary: "Educational innovation and its impact brought by personalized AI tutors",
    keywords: ["AIEducation", "PersonalizedLearning", "FutureEducation", "Tutor"],
    thumbnail: "/ai-tutor-education-future.jpg",
    addedDate: "2024-01-18",
    tab: "Blog by AI" as const,
    type: "blog" as const,
    isPremium: true,
    content: `# Future of Education: The AI Tutor Era

Let's analyze the revolutionary changes that personalized AI tutors will bring to the education field.

## Advantages of AI Tutors

- **24/7 Accessibility**: Learning support anytime
- **Personalized Curriculum**: Customized to learner's level and pace
- **Immediate Feedback**: Real-time error correction and improvement suggestions
- **Infinite Patience**: No burden for repetitive learning

## Expected Changes

The education paradigm will shift from 'uniform education' to 'personalized education'.`,
  },
]

type TabType = "Journals" | "Books" | "Fairy Tales" | "Blog by AI"

export default function HomePage() {
  const [videos] = useState(sampleVideos)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<(typeof sampleVideos)[0] | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<(typeof sampleVideos)[0] | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [selectedAlphabet, setSelectedAlphabet] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("Journals")
  const [showPayment, setShowPayment] = useState(false)
  const { user } = useAuth()

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesTab = video.tab === activeTab

      const matchesSearch =
        searchTerm === "" ||
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No search results found.</p>
                <p className="text-muted-foreground">Try searching with different keywords.</p>
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
  video: (typeof sampleVideos)[0]
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
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-600">AI Blog</Badge>
        )}
        {isPremium && (
          <Badge className="absolute top-2 right-2 bg-amber-500 text-white">프리미엄</Badge>
        )}
      </div>
      <CardHeader className="pb-2" onClick={onPlay}>
        <CardTitle className="text-lg line-clamp-2 text-balance cursor-pointer">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-pretty cursor-pointer">{video.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {video.keywords.map((keyword) => (
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
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground" onClick={onPlay}>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(video.addedDate).toLocaleDateString("en-US")}
          </div>
          {isPremium && (
            <div className="text-amber-500 font-medium">멤버십 전용</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
