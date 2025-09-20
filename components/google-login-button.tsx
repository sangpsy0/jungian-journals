'use client';

import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

export default function GoogleLoginButton() {
  const { user, isLoading, signOut } = useAuth();


  const handleGoogleLogin = async () => {
    try {
      console.log('🚀 Google 로그인 시도');
      console.log('🔧 Redirect URL:', `${window.location.origin}/auth/callback`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('📊 OAuth 응답 데이터:', data);
      console.log('❗ OAuth 에러:', error);

      if (error) {
        console.error('❌ Google 로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다: ' + error.message);
      } else {
        console.log('✅ OAuth 요청 성공, 리다이렉트 진행 중...');
      }
    } catch (error) {
      console.error('💥 예외 발생:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 로그인된 상태면 로그아웃 버튼 표시
  if (user) {
    return (
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        className="flex items-center space-x-2"
        variant="outline"
      >
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </>
        )}
      </Button>
    );
  }

  // 로그인되지 않은 상태면 로그인 버튼 표시
  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center space-x-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      variant="outline"
    >
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}