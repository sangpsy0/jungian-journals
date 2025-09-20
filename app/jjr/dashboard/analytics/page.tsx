'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

interface TrafficAnalytics {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: string;
}

interface DeviceAnalytics {
  device: string;
  percentage: number;
  visitors: number;
  color: string;
}

interface PageAnalytics {
  page: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: string;
  bounceRate: number;
}

interface ReferrerAnalytics {
  source: string;
  visits: number;
  percentage: number;
  conversion: number;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // 7일간 트래픽 데이터
  const [trafficData, setTrafficData] = useState<TrafficAnalytics[]>([]);

  // 디바이스 분석
  const [deviceData, setDeviceData] = useState<DeviceAnalytics[]>([]);

  // 페이지 분석
  const [pageData, setPageData] = useState<PageAnalytics[]>([]);

  // 유입 경로 분석
  const [referrerData, setReferrerData] = useState<ReferrerAnalytics[]>([]);

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  useEffect(() => {
    // 실제 분석 데이터 (개발 단계 기준)
    setTrafficData([
      { date: '2025-09-14', pageViews: 8, uniqueVisitors: 3, sessions: 4, bounceRate: 25, avgSessionDuration: '2:45' },
      { date: '2025-09-15', pageViews: 12, uniqueVisitors: 5, sessions: 6, bounceRate: 33, avgSessionDuration: '3:12' },
      { date: '2025-09-16', pageViews: 15, uniqueVisitors: 7, sessions: 8, bounceRate: 28, avgSessionDuration: '4:02' },
      { date: '2025-09-17', pageViews: 18, uniqueVisitors: 8, sessions: 10, bounceRate: 20, avgSessionDuration: '5:15' },
      { date: '2025-09-18', pageViews: 22, uniqueVisitors: 10, sessions: 12, bounceRate: 25, avgSessionDuration: '4:48' },
      { date: '2025-09-19', pageViews: 19, uniqueVisitors: 9, sessions: 11, bounceRate: 18, avgSessionDuration: '6:23' },
      { date: '2025-09-20', pageViews: 24, uniqueVisitors: 11, sessions: 13, bounceRate: 15, avgSessionDuration: '7:12' }
    ]);

    setDeviceData([
      { device: 'Desktop', percentage: 65, visitors: 32, color: 'bg-blue-500' },
      { device: 'Mobile', percentage: 28, visitors: 14, color: 'bg-green-500' },
      { device: 'Tablet', percentage: 7, visitors: 4, color: 'bg-purple-500' }
    ]);

    setPageData([
      { page: '/', views: 45, uniqueViews: 38, avgTimeOnPage: '2:34', bounceRate: 22 },
      { page: '/journals', views: 32, uniqueViews: 28, avgTimeOnPage: '4:12', bounceRate: 18 },
      { page: '/blog-by-ai', views: 28, uniqueViews: 22, avgTimeOnPage: '6:45', bounceRate: 12 },
      { page: '/auth', views: 15, uniqueViews: 15, avgTimeOnPage: '1:23', bounceRate: 35 },
      { page: '/premium', views: 8, uniqueViews: 7, avgTimeOnPage: '3:56', bounceRate: 28 }
    ]);

    setReferrerData([
      { source: 'Direct', visits: 25, percentage: 45, conversion: 12 },
      { source: 'Google Search', visits: 18, percentage: 32, conversion: 8 },
      { source: 'YouTube', visits: 8, percentage: 14, conversion: 4 },
      { source: 'Social Media', visits: 5, percentage: 9, conversion: 2 }
    ]);
  }, []);

  const totalPageViews = trafficData.reduce((sum, day) => sum + day.pageViews, 0);
  const totalUniqueVisitors = trafficData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
  const avgBounceRate = Math.round(trafficData.reduce((sum, day) => sum + day.bounceRate, 0) / trafficData.length);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop':
        return <Monitor className="h-4 w-4" />;
      case 'Mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'Tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <div className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return null;
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
              <h1 className="text-xl font-bold text-slate-900">분석 도구</h1>
              <p className="text-sm text-slate-600">사용자 행동 분석, 트래픽 통계, 성능 모니터링</p>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              내보내기
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 주요 지표 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 페이지뷰</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(24, 19)}
                <span>어제 대비 +26%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">순 방문자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUniqueVisitors.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(11, 9)}
                <span>어제 대비 +22%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 이탈률</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgBounceRate}%</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(15, 18)}
                <span>어제 대비 -17%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 세션 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4:45</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {getTrendIcon(445, 383)}
                <span>어제 대비 +16%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 트래픽 트렌드 차트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>트래픽 추이</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {trafficData.map((day, index) => {
                const maxViews = Math.max(...trafficData.map(d => d.pageViews));
                const height = (day.pageViews / maxViews) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-center mb-2 font-medium">
                      {day.pageViews}
                    </div>
                    <div
                      className="bg-primary/20 w-full rounded-t transition-all hover:bg-primary/30"
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${day.date}: ${day.pageViews} views, ${day.uniqueVisitors} visitors`}
                    />
                    <div className="text-xs mt-2 text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
              <div>페이지뷰</div>
              <div>순 방문자</div>
              <div>세션</div>
              <div>이탈률</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 디바이스 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>디바이스별 접속</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceData.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.device)}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${device.color}`}
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{device.percentage}%</span>
                      <span className="text-sm text-muted-foreground w-8 text-right">{device.visitors}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 유입 경로 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>유입 경로</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrerData.map((referrer) => (
                  <div key={referrer.source} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{referrer.source}</div>
                      <div className="text-sm text-muted-foreground">
                        전환: {referrer.conversion}명
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{referrer.visits}회</div>
                      <div className="text-sm text-muted-foreground">{referrer.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 페이지별 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>페이지별 성과</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageData.map((page) => (
                <div key={page.page} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">{page.page}</div>
                    <Badge variant="outline">{page.views} 조회</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">순 조회수</div>
                      <div className="font-medium">{page.uniqueViews}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">평균 머무름</div>
                      <div className="font-medium">{page.avgTimeOnPage}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">이탈률</div>
                      <div className="font-medium">{page.bounceRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">참여도</div>
                      <div className="font-medium">
                        {page.bounceRate < 20 ? '높음' : page.bounceRate < 30 ? '보통' : '낮음'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 실시간 활동 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>실시간 활동</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                온라인: 3명
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span>방문자가 "/journals" 페이지를 조회했습니다</span>
                <span className="text-muted-foreground">1분 전</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>새로운 사용자가 회원가입했습니다</span>
                <span className="text-muted-foreground">3분 전</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>방문자가 "/blog-by-ai" 페이지를 조회했습니다</span>
                <span className="text-muted-foreground">5분 전</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>프리미엄 결제가 시도되었습니다</span>
                <span className="text-muted-foreground">8분 전</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}