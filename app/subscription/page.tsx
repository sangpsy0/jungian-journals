'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { generateOrderId } from '@/lib/payment';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 확인
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // 결제 처리 함수
  const handlePayment = async (amount: number, plan: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const orderId = generateOrderId();
      const customerName = user.user_metadata?.name || user.email || '사용자';
      
      // 결제 페이지로 이동
      router.push(`/payment?amount=${amount}&orderId=${orderId}&plan=${plan}&customerName=${encodeURIComponent(customerName)}`);
    } catch (error) {
      console.error('결제 처리 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-8">로그인이 필요합니다...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">프리미엄 멤버십</h1>
      <p className="text-center mb-8 text-gray-600">
        프리미엄 멤버가 되어 모든 콘텐츠를 이용해보세요!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* 월간 플랜 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>월간 멤버십</CardTitle>
            <CardDescription>한 달 동안 모든 콘텐츠 이용</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">₩10,000</p>
            <ul className="mt-4 space-y-2">
              <li>✓ 모든 프리미엄 콘텐츠 이용</li>
              <li>✓ 광고 없는 시청 경험</li>
              <li>✓ 고화질 비디오</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment(10000, '월간 멤버십')}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '구독하기'}
            </Button>
          </CardFooter>
        </Card>

        {/* 분기 플랜 */}
        <Card className="flex flex-col border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">분기 멤버십</CardTitle>
            <CardDescription>3개월 동안 모든 콘텐츠 이용</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">₩25,000</p>
            <p className="text-sm text-green-600 mt-1">17% 할인</p>
            <ul className="mt-4 space-y-2">
              <li>✓ 모든 프리미엄 콘텐츠 이용</li>
              <li>✓ 광고 없는 시청 경험</li>
              <li>✓ 고화질 비디오</li>
              <li>✓ 다운로드 지원</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={() => handlePayment(25000, '분기 멤버십')}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '구독하기'}
            </Button>
          </CardFooter>
        </Card>

        {/* 연간 플랜 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>연간 멤버십</CardTitle>
            <CardDescription>1년 동안 모든 콘텐츠 이용</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-3xl font-bold">₩90,000</p>
            <p className="text-sm text-green-600 mt-1">25% 할인</p>
            <ul className="mt-4 space-y-2">
              <li>✓ 모든 프리미엄 콘텐츠 이용</li>
              <li>✓ 광고 없는 시청 경험</li>
              <li>✓ 고화질 비디오</li>
              <li>✓ 다운로드 지원</li>
              <li>✓ 우선 고객 지원</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePayment(90000, '연간 멤버십')}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '구독하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}