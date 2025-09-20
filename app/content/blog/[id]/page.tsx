"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { PremiumPayment } from "@/components/premium-payment"

interface BlogContent {
  id: string
  title: string
  content: string
  image: string
  keywords: string[]
  created_at: string
  is_premium: boolean
}

export default function BlogPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [blog, setBlog] = useState<BlogContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)

  const canReadContent = user?.user_metadata?.isPremium || false

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_content')
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

        setBlog({
          ...data,
          keywords: processedKeywords
        })
      } catch (error) {
        console.error('Error fetching blog:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const handleUpgradeToPremium = () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!blog) {
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
            <h1 className="text-2xl font-bold mb-4">블로그 글을 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">요청하신 글이 존재하지 않거나 삭제되었습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  const canAccessContent = !blog.is_premium || canReadContent

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
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600">
              Blog by AI
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Blog Title and Meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl font-bold">{blog.title}</h1>
              {blog.is_premium && (
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  프리미엄
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(blog.created_at).toLocaleDateString("ko-KR")}
              </div>
              {blog.is_premium ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <Star className="h-3 w-3 mr-1" />
                  유료 회원용
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  무료
                </Badge>
              )}
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Blog Image */}
          {blog.image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-gray max-w-none">
            {canAccessContent ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                {blog.content.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                        {line.substring(2)}
                      </h1>
                    )
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold mt-6 mb-3">
                        {line.substring(3)}
                      </h2>
                    )
                  } else if (line.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-xl font-medium mt-4 mb-2">
                        {line.substring(4)}
                      </h3>
                    )
                  } else if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 mb-1">
                        {line.substring(2)}
                      </li>
                    )
                  } else if (line.trim() === "") {
                    return <br key={index} />
                  } else {
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {line}
                      </p>
                    )
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-dashed border-amber-300">
                <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">프리미엄 회원 전용 콘텐츠</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  이 콘텐츠는 프리미엄 회원만 읽을 수 있습니다.<br/>
                  AI가 작성한 고품질 블로그 전문을 보려면 프리미엄 구독이 필요합니다.
                </p>
                <Button
                  onClick={handleUpgradeToPremium}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  프리미엄 회원 가입하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Premium Payment Modal */}
      {showPayment && (
        <PremiumPayment
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}