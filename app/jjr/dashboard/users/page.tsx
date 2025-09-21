"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAdmin } from "@/components/admin-provider"
import {
  Users, UserPlus, UserCheck, UserX, Calendar, Mail, Shield,
  ArrowLeft, Search, Filter, Download, Activity, Globe, MapPin, Eye, Star, CreditCard
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface UserData {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
  is_premium: boolean
  premium_expires_at?: string
  total_views: number
  total_content: number
  country?: string
  countryCode?: string
  referrer?: string
}

export default function UsersPage() {
  const router = useRouter()
  const { isAdminLoggedIn, isLoading: adminLoading } = useAdmin()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    avgViews: 0
  })

  useEffect(() => {
    if (!adminLoading && !isAdminLoggedIn) {
      router.push('/jjr')
    }
  }, [isAdminLoggedIn, adminLoading, router])

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchUsers()
    }
  }, [isAdminLoggedIn])

  useEffect(() => {
    // 검색 및 필터링
    let filtered = users

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 국가 필터
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(user => user.countryCode === selectedCountry)
    }

    // 상태 필터
    if (selectedStatus === 'premium') {
      filtered = filtered.filter(user => user.is_premium)
    } else if (selectedStatus === 'free') {
      filtered = filtered.filter(user => !user.is_premium)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, selectedCountry, selectedStatus, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Supabase Auth에서 사용자 목록 가져오기
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error('Auth 사용자 목록 오류:', authError)
        // 일반 사용자 권한일 경우 대체 방법 사용
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        if (currentUser) {
          // 현재 로그인한 사용자 정보만 표시
          const formattedUser: UserData = {
            id: currentUser.id,
            email: currentUser.email || '',
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name,
            avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
            created_at: currentUser.created_at || '',
            last_sign_in_at: currentUser.last_sign_in_at,
            is_premium: false,
            premium_expires_at: undefined,
            total_views: 0,
            total_content: 0,
            country: 'South Korea',
            countryCode: 'KR',
            referrer: 'Direct'
          }

          setUsers([formattedUser])
          setFilteredUsers([formattedUser])

          setStats({
            totalUsers: 1,
            premiumUsers: 0,
            activeToday: 1,
            newThisWeek: 0,
            avgViews: 0
          })
        }

        return
      }

      // 비디오 콘텐츠 조회수 데이터
      const { data: videoContent } = await supabase
        .from('video_content')
        .select('id, views')

      // 블로그 콘텐츠 조회수 데이터
      const { data: blogContent } = await supabase
        .from('blog_content')
        .select('id, views')

      // 총 조회수 계산
      const totalVideoViews = videoContent?.reduce((sum, v) => sum + (v.views || 0), 0) || 0
      const totalBlogViews = blogContent?.reduce((sum, b) => sum + (b.views || 0), 0) || 0
      const totalContentViews = totalVideoViews + totalBlogViews

      // 사용자 데이터 포맷팅
      const formattedUsers: UserData[] = authUsers?.map(user => {
        // 사용자별 평균 조회수 시뮬레이션 (실제로는 user_id와 연결 필요)
        const userViews = Math.floor(totalContentViews / Math.max(authUsers.length, 1))

        // 국가 정보 추출 (user_metadata에서)
        const locale = user.user_metadata?.locale || 'ko'
        const country = locale === 'ko' ? 'South Korea' :
                       locale === 'en' ? 'United States' :
                       locale === 'ja' ? 'Japan' : 'Other'
        const countryCode = locale === 'ko' ? 'KR' :
                           locale === 'en' ? 'US' :
                           locale === 'ja' ? 'JP' : 'XX'

        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at,
          is_premium: false, // 결제 시스템 구현 후 실제 데이터
          premium_expires_at: undefined,
          total_views: userViews,
          total_content: 0,
          country,
          countryCode,
          referrer: 'Google' // 실제로는 추적 시스템 필요
        }
      }) || []

      // 통계 계산
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const stats = {
        totalUsers: formattedUsers.length,
        premiumUsers: formattedUsers.filter(u => u.is_premium).length,
        activeToday: formattedUsers.filter(u => {
          if (!u.last_sign_in_at) return false
          const lastSignIn = new Date(u.last_sign_in_at)
          return lastSignIn.toDateString() === today.toDateString()
        }).length,
        newThisWeek: formattedUsers.filter(u => {
          const createdAt = new Date(u.created_at)
          return createdAt >= weekAgo
        }).length,
        avgViews: formattedUsers.length > 0
          ? Math.round(formattedUsers.reduce((sum, u) => sum + u.total_views, 0) / formattedUsers.length)
          : 0
      }

      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
      setStats(stats)

    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '활동 없음'

    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return '방금 전'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const getCountryFlag = (countryCode?: string) => {
    const flags: { [key: string]: string } = {
      'KR': '🇰🇷',
      'US': '🇺🇸',
      'JP': '🇯🇵',
      'FR': '🇫🇷',
      'DE': '🇩🇪',
      'GB': '🇬🇧',
      'CN': '🇨🇳',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'BR': '🇧🇷'
    }
    return flags[countryCode || 'XX'] || '🌍'
  }

  // 국가별 통계
  const countries = Array.from(new Set(users.map(u => ({
    code: u.countryCode || 'XX',
    name: u.country || 'Unknown'
  })))).filter((country, index, self) =>
    index === self.findIndex(c => c.code === country.code)
  )

  const countryStats = countries.map(country => ({
    ...country,
    count: users.filter(u => u.countryCode === country.code).length,
    premiumCount: users.filter(u => u.countryCode === country.code && u.is_premium).length
  })).sort((a, b) => b.count - a.count)

  // 유입 경로 통계
  const referrerStats = Array.from(new Set(users.map(u => u.referrer || 'Direct')))
    .map(referrer => ({
      name: referrer,
      count: users.filter(u => (u.referrer || 'Direct') === referrer).length,
      percentage: Math.round((users.filter(u => (u.referrer || 'Direct') === referrer).length / Math.max(users.length, 1)) * 100)
    }))
    .sort((a, b) => b.count - a.count)

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
              <h1 className="text-xl font-bold text-slate-900">사용자 관리</h1>
              <p className="text-sm text-slate-600">가입자 분석 및 국가별 통계</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {countries.length}개 국가에서 가입
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">프리미엄 사용자</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeToday}</div>
              <p className="text-xs text-muted-foreground">
                오늘 로그인
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 조회수</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgViews}</div>
              <p className="text-xs text-muted-foreground">
                사용자당 평균
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 국가별 통계 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>국가별 사용자 분포</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryStats.length > 0 ? (
                  countryStats.map((country) => (
                    <div key={country.code} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCountryFlag(country.code)}</span>
                        <div>
                          <div className="font-medium">{country.name}</div>
                          <div className="text-sm text-muted-foreground">
                            프리미엄: {country.premiumCount}명
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{country.count}명</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((country.count / Math.max(users.length, 1)) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    사용자 데이터를 수집 중입니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 유입 경로 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>유입 경로</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrerStats.length > 0 ? (
                  referrerStats.map((referrer) => (
                    <div key={referrer.name} className="flex items-center justify-between">
                      <div className="font-medium">{referrer.name}</div>
                      <div className="text-right">
                        <div className="font-bold">{referrer.count}명</div>
                        <div className="text-xs text-muted-foreground">
                          {referrer.percentage}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    유입 경로 데이터를 수집 중입니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이메일이나 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="all">전체 국가</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {getCountryFlag(country.code)} {country.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="all">전체 상태</option>
                  <option value="premium">프리미엄</option>
                  <option value="free">무료</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || user.email}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{user.full_name || user.email.split('@')[0]}</h3>
                        {user.is_premium && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            <Star className="h-3 w-3 mr-1" />
                            프리미엄
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">{getCountryFlag(user.countryCode)}</span>
                          <span>{user.country || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>가입: {new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>조회수: {user.total_views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>유입: {user.referrer || 'Direct'}</span>
                        </div>
                        {user.premium_expires_at && (
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-3 w-3" />
                            <span>만료: {new Date(user.premium_expires_at).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">마지막 로그인</div>
                    <div className="font-medium">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR')
                        : '정보 없음'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedCountry !== 'all' || selectedStatus !== 'all'
                  ? '검색 결과가 없습니다'
                  : '사용자가 없습니다'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCountry !== 'all' || selectedStatus !== 'all'
                  ? '다른 조건으로 검색해보세요.'
                  : '첫 번째 사용자가 가입하기를 기다리고 있습니다.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}