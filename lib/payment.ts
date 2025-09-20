import { nanoid } from 'nanoid';

declare global {
  interface Window {
    PaymentWidget: any;
  }
}

// 토스페이먼츠 클라이언트 키
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

// 토스페이먼츠 위젯 로드
export async function loadTossPaymentsWidget() {
  if (typeof window !== 'undefined') {
    const paymentWidget = window.PaymentWidget(TOSS_CLIENT_KEY, TOSS_CUSTOMER_KEY);
    return paymentWidget;
  }
  return null;
}

// 결제 요청 생성
export function createPaymentRequest(amount: number, orderId: string, orderName: string, customerName: string) {
  return {
    amount,
    orderId,
    orderName,
    customerName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  };
}

// 주문 ID 생성 (고유한 ID)
export function generateOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// 결제 금액에 따른 구독 기간 계산 (월 단위)
export function getSubscriptionMonths(amount: number) {
  // 예시: 10,000원 = 1개월, 25,000원 = 3개월, 50,000원 = 6개월, 90,000원 = 12개월
  if (amount >= 90000) return 12;
  if (amount >= 50000) return 6;
  if (amount >= 25000) return 3;
  return 1;
}