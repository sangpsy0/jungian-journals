import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('🔄 Auth callback 받음:', {
    code: code ? '있음' : '없음',
    url: requestUrl.toString(),
    searchParams: Object.fromEntries(requestUrl.searchParams)
  });

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      console.log('🔄 세션 교환 시도 중...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ 세션 교환 오류:', error);
      } else {
        console.log('✅ 세션 교환 성공:', data);
      }
    } catch (error) {
      console.error('💥 세션 교환 예외:', error);
    }
  }

  // URL to redirect to after sign in process completes
  console.log('🏠 메인 페이지로 리다이렉트');
  return NextResponse.redirect(requestUrl.origin);
}