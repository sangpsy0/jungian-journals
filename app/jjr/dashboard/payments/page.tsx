'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Search,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  User,
  Receipt
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

interface PaymentData {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  paymentKey?: string;
  failureReason?: string;
}

export default function PaymentManagement() {
  const router = useRouter();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [payments, setPayments] = useState<PaymentData[]>([]);

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  useEffect(() => {
    // 실제 결제 데이터 (샘플)
    const paymentData: PaymentData[] = [
      {
        id: '1',
        orderId: 'premium_lifetime_1758343135130_ecnzu2odw',
        userId: 'demo-user-1',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        amount: 9900,
        currency: 'KRW',
        status: 'failed',
        paymentMethod: '토스페이먼츠 카드',
        createdAt: '2025-09-20T04:38:55Z',
        failureReason: 'Payment is cancelled by the user.'
      },
      {
        id: '2',
        orderId: 'premium_lifetime_1708234567890_abc123xyz',
        userId: 'demo-user-3',
        userEmail: 'marie.dubois@example.fr',
        userName: 'Marie Dubois',
        amount: 9900,
        currency: 'KRW',
        status: 'completed',
        paymentMethod: '토스페이먼츠 카드',
        createdAt: '2024-03-10T14:20:00Z',
        completedAt: '2024-03-10T14:21:15Z',
        paymentKey: 'tglob20240310142115abcD3'
      },
      {
        id: '3',
        orderId: 'premium_lifetime_1706123456789_def456uvw',
        userId: 'demo-user-1',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        amount: 9900,
        currency: 'KRW',
        status: 'completed',
        paymentMethod: '토스페이먼츠 카드',
        createdAt: '2024-02-01T09:30:00Z',
        completedAt: '2024-02-01T09:31:22Z',
        paymentKey: 'tglob20240201093122efgH5'
      },
      {
        id: '4',
        orderId: 'premium_lifetime_1705987654321_ghi789rst',
        userId: 'demo-user-5',
        userEmail: 'lisa.kim@example.com',
        userName: 'Lisa Kim',
        amount: 9900,
        currency: 'KRW',
        status: 'pending',
        paymentMethod: '토스페이먼츠 카드',
        createdAt: '2025-09-19T16:45:00Z'
      }
    ];

    setPayments(paymentData);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            완료
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            실패
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Receipt className="h-3 w-3 mr-1" />
            환불
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
              <h1 className="text-xl font-bold text-slate-900">결제 관리</h1>
              <p className="text-sm text-slate-600">결제 내역 및 수익 분석</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 수익</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {completedPayments}건의 성공 결제
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">성공률</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.length > 0 ? Math.round((completedPayments / payments.length) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                총 {payments.length}건 중 {completedPayments}건 성공
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">실패 결제</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedPayments}</div>
              <p className="text-xs text-muted-foreground">
                분석 및 개선 필요
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중 결제</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                처리 대기 중
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 월별 수익 차트 (간단한 시각화) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>월별 수익 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 h-32">
              {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'].map((month, index) => {
                const monthRevenue = index === 1 ? 9900 : index === 2 ? 9900 : 0; // 2월, 3월에 결제
                const height = monthRevenue > 0 ? (monthRevenue / 9900) * 100 : 5;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-primary/20 w-full rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs mt-2 text-muted-foreground">{month}</div>
                    <div className="text-xs font-medium">
                      {monthRevenue > 0 ? `₩${monthRevenue.toLocaleString()}` : '₩0'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="주문번호, 이메일, 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="all">전체 상태</option>
                  <option value="completed">완료</option>
                  <option value="failed">실패</option>
                  <option value="pending">대기중</option>
                  <option value="refunded">환불</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결제 내역 목록 */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">주문 #{payment.orderId}</h3>
                          {getStatusBadge(payment.status)}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{payment.userName} ({payment.userEmail})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(payment.createdAt).toLocaleString('ko-KR')}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div>결제수단: {payment.paymentMethod}</div>
                          {payment.paymentKey && (
                            <div>결제키: {payment.paymentKey}</div>
                          )}
                        </div>

                        {payment.failureReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            실패 사유: {payment.failureReason}
                          </div>
                        )}

                        {payment.completedAt && (
                          <div className="mt-1 text-sm text-green-600">
                            완료시간: {new Date(payment.completedAt).toLocaleString('ko-KR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">
                      {payment.currency === 'KRW' ? '₩' : '$'}{payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.currency}
                    </div>

                    {payment.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          // 결제 상세 정보 보기 또는 영수증 다운로드
                          alert('결제 상세 정보');
                        }}
                      >
                        상세 보기
                      </Button>
                    )}

                    {payment.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          // 실패 원인 분석
                          alert('실패 원인 분석');
                        }}
                      >
                        원인 분석
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 조건으로 검색해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}