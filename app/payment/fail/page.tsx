'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 실패 정보
  const message = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';
  const code = searchParams.get('code') || '';

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">결제 실패</h2>
        <p className="mb-2">{message}</p>
        {code && <p className="text-sm">오류 코드: {code}</p>}
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => router.push('/subscription')}>
          다시 시도하기
        </Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}