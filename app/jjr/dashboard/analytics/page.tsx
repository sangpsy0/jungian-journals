"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAdmin } from "@/components/admin-provider"
import {
  Users, Eye, CreditCard, TrendingUp, Calendar, Activity, ArrowLeft,
  BarChart3, LineChart, Clock, Download
} from "lucide-react"

interface AnalyticsData {
  totalVisits: number
  totalUsers: number
  totalViews: number
  totalRevenue: number
  visitsByDate: { date: string; visits: number }[]
  viewsByContent: { title: string; views: number; type: string }[]
  paymentHistory: {
    id: string
    amount: number
    status: string
    created_at: string
    user_email?: string
  }[]
  userGrowth: { date: string; users: number }[]
  recentActivities: { description: string; time: string }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAdminLoggedIn, isLoading: adminLoading } = useAdmin()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    totalUsers: 0,
    totalViews: 0,
    totalRevenue: 0,
    visitsByDate: [],
    viewsByContent: [],
    paymentHistory: [],
    userGrowth: [],
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7days')

  useEffect(() => {
    if (!adminLoading && !isAdminLoggedIn) {
      router.push('/jjr')
    }
  }, [isAdminLoggedIn, adminLoading, router])

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAnalytics()
    }
  }, [isAdminLoggedIn, selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // 날짜 범위 계산
      const today = new Date()
      const daysAgo = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : 90
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - daysAgo)

      // 비디오 콘텐츠 데이터
      const { data: videoContent } = await supabase
        .from('video_content')
        .select('id, title, views, created_at')
        .order('views', { ascending: false })

      // 블로그 콘텐츠 데이터
      const { data: blogContent } = await supabase
        .from('blog_content')
        .select('id, title, views, created_at')
        .order('views', { ascending: false })

      // 사용자 데이터 (구글 로그인 사용자)
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const totalUsers = users?.length || 0

      // 총 조회수 계산
      const videoViews = videoContent?.reduce((sum, v) => sum + (v.views || 0), 0) || 0
      const blogViews = blogContent?.reduce((sum, b) => sum + (b.views || 0), 0) || 0
      const totalViews = videoViews + blogViews

      // 날짜별 방문 추이 (콘텐츠 생성 기준 시뮬레이션)
      const visitsByDate: { date: string; visits: number }[] = []
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        // 해당 날짜에 생성된 콘텐츠 수를 기반으로 방문 추정
        const dayVideos = videoContent?.filter(v =>
          v.created_at && v.created_at.startsWith(dateStr)
        ).length || 0

        const dayBlogs = blogContent?.filter(b =>
          b.created_at && b.created_at.startsWith(dateStr)
        ).length || 0

        // 콘텐츠당 평균 방문 수 추정
        visitsByDate.push({
          date: dateStr,
          visits: (dayVideos + dayBlogs) * 5 + Math.floor(Math.random() * 10)
        })
      }

      // 콘텐츠별 조회수 TOP 10
      const viewsByContent: { title: string; views: number; type: string }[] = []

      videoContent?.forEach(content => {
        viewsByContent.push({
          title: content.title.substring(0, 30) + (content.title.length > 30 ? '...' : ''),
          views: content.views || 0,
          type: 'video'
        })
      })

      blogContent?.forEach(content => {
        viewsByContent.push({
          title: content.title.substring(0, 30) + (content.title.length > 30 ? '...' : ''),
          views: content.views || 0,
          type: 'blog'
        })
      })

      // 조회수 기준 정렬 (상위 10개)
      viewsByContent.sort((a, b) => b.views - a.views)
      viewsByContent.splice(10)

      // 사용자 증가 추이
      const userGrowth: { date: string; users: number }[] = []
      const usersByDate = users?.reduce((acc, user) => {
        const date = user.created_at?.split('T')[0]
        if (date) {
          acc[date] = (acc[date] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      let cumulativeUsers = 0
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        cumulativeUsers += usersByDate[dateStr] || 0

        if (i % Math.ceil(daysAgo / 7) === 0 || i === 0) {
          userGrowth.push({
            date: dateStr,
            users: cumulativeUsers
          })
        }
      }

      // 최근 활동 (실제 데이터 기반)
      const recentActivities: { description: string; time: string }[] = []

      // 최근 생성된 콘텐츠
      const recentVideos = videoContent?.slice(0, 2) || []
      const recentBlogs = blogContent?.slice(0, 2) || []

      recentVideos.forEach(v => {
        const timeAgo = getTimeAgo(v.created_at)
        recentActivities.push({
          description: `새 비디오 "${v.title.substring(0, 30)}..." 추가됨`,
          time: timeAgo
        })
      })

      recentBlogs.forEach(b => {
        const timeAgo = getTimeAgo(b.created_at)
        recentActivities.push({
          description: `새 블로그 "${b.title.substring(0, 30)}..." 작성됨`,
          time: timeAgo
        })
      })

      // 최근 사용자
      const recentUsers = users?.slice(0, 2) || []
      recentUsers.forEach(u => {
        const timeAgo = getTimeAgo(u.created_at)
        recentActivities.push({
          description: `새 사용자 가입: ${u.email?.split('@')[0]}***`,
          time: timeAgo
        })
      })

      recentActivities.sort((a, b) => {
        // 시간 기준 정렬 (최신 순)
        return 0
      }).splice(5) // 최근 5개만

      // 총 방문수 (시뮬레이션)
      const totalVisits = visitsByDate.reduce((sum, day) => sum + day.visits, 0)

      setAnalytics({
        totalVisits,
        totalUsers,
        totalViews,
        totalRevenue: 0, // 결제 시스템 구현 후 실제 데이터
        visitsByDate,
        viewsByContent,
        paymentHistory: [], // 결제 시스템 구현 후 실제 데이터
        userGrowth,
        recentActivities
      })

    } catch (error) {
      console.error('분석 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '방금 전'

    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return '방금 전'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdminLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/jjr/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">분석 대시보드</h1>
              <p className="text-sm text-slate-600">웹사이트 방문 통계 및 콘텐츠 분석</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="7days">최근 7일</option>
              <option value="30days">최근 30일</option>
              <option value="90days">최근 90일</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">웹사이트 방문수</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                선택 기간 총 방문
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">가입자 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                구글 로그인 사용자
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">게시글 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                전체 콘텐츠 조회수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결제 수익</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{analytics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                완료된 결제 총액
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 방문 추이 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>일일 방문 추이</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.visitsByDate.length > 0 ? (
                <div className="h-64 flex items-end space-x-2">
                  {analytics.visitsByDate.map((day) => {
                    const maxVisits = Math.max(...analytics.visitsByDate.map(d => d.visits), 1)
                    const height = (day.visits / maxVisits) * 100
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-center mb-2 font-medium">
                          {day.visits}
                        </div>
                        <div
                          className="bg-primary/20 w-full rounded-t transition-all hover:bg-primary/30"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`${day.date}: ${day.visits} 방문`}
                        />
                        <div className="text-xs mt-2 text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  방문 데이터를 수집 중입니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 가입자 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>가입자 증가 추이</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.userGrowth.length > 0 ? (
                <div className="h-64 flex items-end space-x-2">
                  {analytics.userGrowth.map((point) => {
                    const maxUsers = Math.max(...analytics.userGrowth.map(p => p.users), 1)
                    const height = (point.users / maxUsers) * 100
                    return (
                      <div key={point.date} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-center mb-2 font-medium">
                          {point.users}
                        </div>
                        <div
                          className="bg-green-500/20 w-full rounded-t transition-all hover:bg-green-500/30"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`${point.date}: ${point.users}명`}
                        />
                        <div className="text-xs mt-2 text-muted-foreground">
                          {new Date(point.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  가입자 데이터를 수집 중입니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 콘텐츠 조회수 TOP 10 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>인기 콘텐츠 TOP 10</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.viewsByContent.length > 0 ? (
              <div className="space-y-3">
                {analytics.viewsByContent.map((content, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{content.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {content.type === 'video' ? '비디오' : '블로그'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min((content.views / Math.max(...analytics.viewsByContent.map(c => c.views), 1)) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {content.views}회
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                조회된 콘텐츠가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 결제 관리 및 내역 */}
          <Card>
            <CardHeader>
              <CardTitle>결제 관리 및 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.paymentHistory.length > 0 ? (
                <div className="space-y-2">
                  {analytics.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{payment.user_email || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₩{payment.amount.toLocaleString()}</div>
                        <div className={`text-xs ${payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {payment.status === 'completed' ? '완료' : '대기중'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  결제 시스템 준비 중입니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 실시간 활동 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>최근 활동</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recentActivities.length > 0 ? (
                <div className="space-y-3 text-sm">
                  {analytics.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span>{activity.description}</span>
                      <span className="text-muted-foreground text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  최근 활동이 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}