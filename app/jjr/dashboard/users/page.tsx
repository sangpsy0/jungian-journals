'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  ArrowLeft,
  Globe,
  UserCheck,
  Calendar,
  Mail,
  MapPin,
  Star,
  CreditCard,
  Eye,
  Filter
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

interface UserData {
  id: string;
  email: string;
  name: string;
  country: string;
  countryCode: string;
  joinDate: string;
  isPremium: boolean;
  lastLogin: string;
  totalViews: number;
  subscriptionDate?: string;
  referrer: string;
  avatar?: string;
}

export default function UserManagement() {
  const router = useRouter();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  useEffect(() => {
    // 실제 사용자 데이터 (확장된 샘플)
    const userData: UserData[] = [
      {
        id: '1fe7bee1-717b-473b-8154-f21d5de2386c',
        email: 'cyborg17th@gmail.com',
        name: 'sangchun park',
        country: 'South Korea',
        countryCode: 'KR',
        joinDate: '2025-09-19',
        isPremium: false,
        lastLogin: '2025-09-20T00:07:11Z',
        totalViews: 28,
        referrer: 'Direct',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLjdsIowAxuWQmVVa5uWM8jZo9m8ZDhPsUhRsawTptpfHWAlQ=s96-c'
      },
      {
        id: 'demo-user-1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        country: 'United States',
        countryCode: 'US',
        joinDate: '2024-01-15',
        isPremium: true,
        lastLogin: '2025-09-19T15:30:00Z',
        totalViews: 245,
        subscriptionDate: '2024-02-01',
        referrer: 'Google Search'
      },
      {
        id: 'demo-user-2',
        email: 'yuki.tanaka@example.jp',
        name: 'Yuki Tanaka',
        country: 'Japan',
        countryCode: 'JP',
        joinDate: '2024-01-20',
        isPremium: false,
        lastLogin: '2025-09-18T09:15:00Z',
        totalViews: 156,
        referrer: 'Social Media'
      },
      {
        id: 'demo-user-3',
        email: 'marie.dubois@example.fr',
        name: 'Marie Dubois',
        country: 'France',
        countryCode: 'FR',
        joinDate: '2024-01-25',
        isPremium: true,
        lastLogin: '2025-09-17T14:20:00Z',
        totalViews: 189,
        subscriptionDate: '2024-03-10',
        referrer: 'YouTube'
      },
      {
        id: 'demo-user-4',
        email: 'hans.mueller@example.de',
        name: 'Hans Mueller',
        country: 'Germany',
        countryCode: 'DE',
        joinDate: '2024-02-01',
        isPremium: false,
        lastLogin: '2025-09-16T11:45:00Z',
        totalViews: 98,
        referrer: 'Direct'
      }
    ];

    setUsers(userData);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || user.countryCode === selectedCountry;
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'premium' && user.isPremium) ||
                         (selectedStatus === 'free' && !user.isPremium);
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const countries = Array.from(new Set(users.map(u => ({ code: u.countryCode, name: u.country }))))
    .sort((a, b) => a.name.localeCompare(b.name));

  const countryStats = countries.map(country => ({
    ...country,
    count: users.filter(u => u.countryCode === country.code).length,
    premiumCount: users.filter(u => u.countryCode === country.code && u.isPremium).length
  }));

  const referrerStats = Array.from(new Set(users.map(u => u.referrer)))
    .map(referrer => ({
      name: referrer,
      count: users.filter(u => u.referrer === referrer).length,
      percentage: Math.round((users.filter(u => u.referrer === referrer).length / users.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const getCountryFlag = (countryCode: string) => {
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
    };
    return flags[countryCode] || '🌍';
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
              <div className="text-2xl font-bold">{users.length}</div>
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
              <div className="text-2xl font-bold">
                {users.filter(u => u.isPremium).length}
              </div>
              <p className="text-xs text-muted-foreground">
                전체의 {Math.round((users.filter(u => u.isPremium).length / users.length) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => {
                  const lastLogin = new Date(u.lastLogin);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return lastLogin > weekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                최근 7일 로그인
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 조회수</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(users.reduce((sum, u) => sum + u.totalViews, 0) / users.length)}
              </div>
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
                {countryStats.map((country) => (
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
                        {Math.round((country.count / users.length) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
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
                {referrerStats.map((referrer) => (
                  <div key={referrer.name} className="flex items-center justify-between">
                    <div className="font-medium">{referrer.name}</div>
                    <div className="text-right">
                      <div className="font-bold">{referrer.count}명</div>
                      <div className="text-xs text-muted-foreground">
                        {referrer.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
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
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
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
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.isPremium && (
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
                          <span>{user.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>가입: {new Date(user.joinDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>조회수: {user.totalViews}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>유입: {user.referrer}</span>
                        </div>
                        {user.subscriptionDate && (
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-3 w-3" />
                            <span>구독: {new Date(user.subscriptionDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">마지막 로그인</div>
                    <div className="font-medium">
                      {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.lastLogin).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 조건으로 검색해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}