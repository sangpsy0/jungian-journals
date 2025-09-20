'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadTossPaymentsWidget, createPaymentRequest } from '@/lib/payment';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 결제 정보 가져오기
  const amount = Number(searchParams.get('amount') || 0);
  const orderId = searchParams.get('orderId') || '';
  const plan = searchParams.get('plan') || '멤버십';
  const customerName = searchParams.get('customerName') || '사용자';

  useEffect(() => {
    // 로그인 확인
    if (!user) {
      router.push('/');
      return;
    }

    // 결제 정보 확인
    if (!amount || !orderId) {
      setError('결제 정보가 올바르지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 토스페이먼츠 위젯 초기화
    const initPayment = async () => {
      try {
        const paymentWidget = await loadTossPaymentsWidget();
        if (!paymentWidget) {
          throw new Error('결제 위젯을 로드할 수 없습니다.');
        }

        // 결제 위젯 렌더링
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: amount },
          { variantKey: 'DEFAULT' }
        );

        // 결제 버튼 렌더링
        paymentWidget.renderAgreement('#agreement');

        // 결제 위젯 준비
        const paymentRequest = createPaymentRequest(
          amount,
          orderId,
          `${plan} 구독`,
          customerName
        );

        // 결제 버튼 이벤트 설정
        const payButton = document.getElementById('payment-button');
        if (payButton) {
          payButton.addEventListener('click', async () => {
            try {
              await paymentWidget.requestPayment({
                ...paymentRequest,
                customerEmail: user.email,
              });
            } catch (error: any) {
              console.error('결제 요청 오류:', error);
              if (error.code === 'USER_CANCEL') {
                alert('결제가 취소되었습니다.');
              } else {
                alert(`결제 오류: ${error.message}`);
              }
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('결제 초기화 오류:', error);
        setError('결제 시스템을 초기화하는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    initPayment();
  }, [amount, orderId, plan, customerName, user, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>결제 시스템을 준비하고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push('/subscription')}>
          구독 페이지로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{plan} 결제</h1>
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">결제 정보</h2>
          <p className="mb-1"><span className="font-medium">상품:</span> {plan}</p>
          <p className="mb-1"><span className="font-medium">가격:</span> {amount.toLocaleString()}원</p>
          <p className="mb-4"><span className="font-medium">주문번호:</span> {orderId}</p>
        </div>
        
        {/* 토스페이먼츠 결제 위젯이 렌더링될 영역 */}
        <div id="payment-widget" className="mb-4"></div>
        <div id="agreement" className="mb-4"></div>
        
        <Button id="payment-button" className="w-full">
          결제하기
        </Button>
      </div>
    </div>
  );
}