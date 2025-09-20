'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Check, X } from 'lucide-react';
import { useAuth } from './auth-provider';

// TossPayments 타입 정의
declare global {
  interface Window {
    TossPayments: any;
  }
}

interface PremiumPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PremiumPayment({ isOpen, onClose, onSuccess }: PremiumPaymentProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const paymentMethodsRef = useRef<HTMLDivElement>(null);
  const widgetInitializedRef = useRef<boolean>(false);

  // 테스트용 결제위젯 클라이언트 키
  const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
  const customerKey = user?.id || 'anonymous';

  // Clean up widget when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log('🧹 모달 닫힘 - 위젯 정리 중...');
      setPaymentWidget(null);
      setIsWidgetLoaded(false);
      widgetInitializedRef.current = false;

      // Clear the payment methods div
      if (paymentMethodsRef.current) {
        paymentMethodsRef.current.innerHTML = '';
      }
      return;
    }

    // Prevent double initialization
    if (widgetInitializedRef.current || isWidgetLoaded) {
      console.log('⚠️ 위젯 이미 초기화됨, 스킵');
      return;
    }

    console.log('💰 결제위젯 초기화 시작:', { isOpen, customerKey, isWidgetLoaded });

    const loadTossPayments = async () => {
      try {
        widgetInitializedRef.current = true;

        console.log('🔄 TossPayments 스크립트 로딩...');

        // 스크립트가 이미 로드되었는지 확인
        if (!window.TossPayments) {
          console.log('📥 스크립트 로드 중...');
          const script = document.createElement('script');
          script.src = 'https://js.tosspayments.com/v2/standard';
          script.async = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          console.log('✅ 스크립트 로드 완료');
        }

        // Ensure payment methods div is ready
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('🏗️ TossPayments 위젯 생성 중...');
        const tossPayments = window.TossPayments(clientKey);
        const widgets = tossPayments.widgets({
          customerKey,
        });

        console.log('💵 결제 금액 설정 중...');
        // 결제 금액 설정 (평생 이용료: ₩9,900)
        await widgets.setAmount({
          currency: 'KRW',
          value: 9900,
        });

        console.log('🎨 결제 UI 렌더링 중...');
        // 결제 UI 렌더링
        await widgets.renderPaymentMethods({
          selector: '#payment-methods',
          variantKey: 'DEFAULT',
        });

        console.log('✅ 결제위젯 초기화 완료');
        setPaymentWidget(widgets);
        setIsWidgetLoaded(true);
      } catch (error) {
        console.error('❌ 토스페이먼트 초기화 오류:', error);
        widgetInitializedRef.current = false;
        setIsWidgetLoaded(false);
      }
    };

    loadTossPayments();
  }, [isOpen, customerKey]);

  const handlePayment = async () => {
    if (!paymentWidget || !user) return;

    setIsLoading(true);

    try {
      await paymentWidget.requestPayment({
        orderId: `premium_lifetime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderName: 'Jungian Journals Premium Lifetime Access',
        customerEmail: user.email,
        customerName: user.user_metadata?.full_name || user.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error('결제 요청 오류:', error);
      alert('결제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="premium-payment-description">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1 pr-4">
            <DialogTitle className="text-2xl font-bold text-balance leading-tight mb-2">
              Premium Lifetime Access
            </DialogTitle>
            <p id="premium-payment-description" className="text-muted-foreground text-pretty">
              Get unlimited access to premium AI-generated blog content forever
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* 구독 플랜 */}
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-amber-500 mr-2" />
                <CardTitle className="text-xl">Lifetime Premium</CardTitle>
              </div>
              <div className="text-3xl font-bold">₩9,900 <span className="text-lg font-normal text-muted-foreground">one-time</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited access to AI blog content</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Early access to new content</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Ad-free reading experience</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Premium exclusive content</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>🎉 Lifetime access - pay once, enjoy forever!</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 결제 방법 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div id="payment-methods" ref={paymentMethodsRef} className="min-h-[200px] border border-gray-200 rounded-lg p-4">
              {!isWidgetLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading payment methods...</span>
                </div>
              )}
            </div>
          </div>

          {/* 결제 버튼 */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !paymentWidget}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing payment...</span>
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                Get Lifetime Access for ₩9,900
              </>
            )}
          </Button>

          {/* 이용약관 */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>By completing payment, you agree to our Premium Service Terms.</p>
            <p>One-time payment gives you lifetime access to all premium content.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}