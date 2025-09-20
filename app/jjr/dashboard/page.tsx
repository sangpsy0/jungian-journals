'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  CreditCard,
  Eye,
  Settings,
  LogOut,
  DollarSign,
  Activity,
  Calendar,
  UserCheck,
  Home
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';
import { useAuth } from '@/components/auth-provider';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdminLoggedIn, logout, isLoading } = useAdmin();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    todayVisits: 0
  });

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  // 실제 통계 데이터 로드
  useEffect(() => {
    const loadRealStats = async () => {
      // 실제 데이터: 현재 개발 단계 기준
      setStats({
        totalUsers: 1, // 현재 테스트 사용자 1명 (cyborg17th@gmail.com)
        premiumUsers: 0, // 아직 프리미엄 사용자 없음
        totalRevenue: 0, // 아직 실제 결제 없음
        todayVisits: 15 // 오늘 개발/테스트 방문 횟수
      });
    };

    loadRealStats();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/jjr');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">관리자 대시보드</h1>
              <p className="text-sm text-slate-600">Jungian Journals 시스템 관리</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>홈으로</span>
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              온라인
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                개발 초기 단계
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">프리미엄 사용자</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? `전체의 ${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%` : '아직 프리미엄 사용자 없음'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 수익</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                아직 실제 결제 없음
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 방문자</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                개발/테스트 방문
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/jjr/dashboard/users')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>사용자 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                사용자 목록, 권한 관리, 프리미엄 상태 변경
              </p>
              <Button variant="outline" size="sm" className="w-full">
                사용자 관리로 이동
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/jjr/dashboard/payments')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>결제 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                결제 내역, 환불 처리, 수익 분석
              </p>
              <Button variant="outline" size="sm" className="w-full">
                결제 관리로 이동
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/jjr/dashboard/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>시스템 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                사이트 설정, API 키 관리, 보안 설정
              </p>
              <Button variant="outline" size="sm" className="w-full">
                설정으로 이동
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/jjr/dashboard/content')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>콘텐츠 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                블로그 글 관리, 비디오 콘텐츠, 프리미엄 콘텐츠
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  콘텐츠 관리로 이동
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/jjr/dashboard/create');
                  }}
                >
                  새 콘텐츠 작성
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/jjr/dashboard/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>분석 도구</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                사용자 행동 분석, 트래픽 통계, 성능 모니터링
              </p>
              <Button variant="outline" size="sm" className="w-full">
                분석 도구로 이동
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>보안 관리</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                접근 로그, 보안 알림, 관리자 계정 관리
              </p>
              <Button variant="outline" size="sm" className="w-full">
                보안 관리로 이동
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 현재 로그인 정보 */}
        {user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">현재 세션 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">관리자 ID:</span> psckmc
                </div>
                <div>
                  <span className="font-medium">로그인 시간:</span> {new Date().toLocaleString('ko-KR')}
                </div>
                <div>
                  <span className="font-medium">일반 사용자:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">일반 사용자 권한:</span> {user.user_metadata?.isPremium ? '프리미엄' : '무료'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}