'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Home } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        if (!paymentKey || !orderId || !amount) {
          throw new Error('결제 정보가 누락되었습니다.');
        }

        // 사용자 프리미엄 상태 업데이트
        if (user) {
          const { error } = await supabase.auth.updateUser({
            data: {
              isPremium: true,
              subscriptionDate: new Date().toISOString(),
              paymentKey: paymentKey,
              orderId: orderId,
            }
          });

          if (error) {
            console.error('사용자 상태 업데이트 오류:', error);
          }
        }

        setPaymentInfo({
          paymentKey,
          orderId,
          amount: parseInt(amount),
          orderName: 'Jungian Journals Premium Lifetime Access',
          approvedAt: new Date().toISOString(),
        });

        setIsProcessing(false);
      } catch (error: any) {
        console.error('결제 처리 오류:', error);
        setError(error.message || '결제 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user, router]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">결제를 처리하고 있습니다...</p>
            <p className="text-muted-foreground mt-2">잠시만 기다려주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">결제 처리 오류</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={handleGoHome} className="w-full">
              홈으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Completed!</CardTitle>
          <p className="text-muted-foreground">Lifetime Premium access has been activated.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 결제 정보 */}
          {paymentInfo && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{paymentInfo.orderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium">₩{paymentInfo.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium text-xs">{paymentInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium">
                  {new Date(paymentInfo.approvedAt).toLocaleString('en-US')}
                </span>
              </div>
            </div>
          )}

          {/* 프리미엄 혜택 안내 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Star className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-semibold">Your Premium Benefits</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Unlimited access to AI blog content</li>
              <li>• Early access to new content</li>
              <li>• Ad-free reading experience</li>
              <li>• Premium exclusive content</li>
              <li>• 🎉 Lifetime access - no recurring payments!</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Button onClick={handleGoHome} className="w-full" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Start enjoying unlimited access to all premium content!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}