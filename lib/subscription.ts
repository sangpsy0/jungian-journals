import { createClient } from '@supabase/supabase-js';

// 구독 상태 타입 정의
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'none';

// 구독 정보 타입 정의
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paymentId: string;
}

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 사용자의 구독 상태 확인
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  // 구독 데이터 변환
  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    paymentId: data.payment_id
  };
}

// 구독 상태 확인 (활성 여부)
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  
  const now = new Date();
  return (
    subscription.status === 'active' && 
    subscription.endDate > now
  );
}

// 새 구독 생성
export async function createSubscription(
  userId: string, 
  paymentId: string, 
  months: number = 1
): Promise<Subscription | null> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_id: paymentId
    })
    .select()
    .single();
  
  if (error || !data) {
    console.error('구독 생성 오류:', error);
    return null;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    paymentId: data.payment_id
  };
}

// 구독 취소
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscriptionId);
  
  return !error;
}