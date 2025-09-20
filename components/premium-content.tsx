'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { getUserSubscription, isSubscriptionActive } from '@/lib/subscription';

interface PremiumContentProps {
  children: React.ReactNode;
}

export default function PremiumContent({ children }: PremiumContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }

      try {
        const subscriptionStatus = await getUserSubscription(user.id);
        setIsSubscribed(isSubscriptionActive(subscriptionStatus));
      } catch (error) {
        console.error('구독 상태 확인 오류:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 border rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-xl font-bold mb-2">프리미엄 콘텐츠</h3>
        <p className="mb-4">이 콘텐츠는 프리미엄 회원만 이용할 수 있습니다.</p>
        <div className="flex space-x-4">
          <Button onClick={() => router.push('/subscription')}>
            멤버십 가입하기
          </Button>
          {!user && (
            <Button variant="outline" onClick={() => router.push('/login')}>
              로그인
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}