'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      try {
        console.log('🔄 AuthProvider: 세션 확인 중...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ 세션 가져오기 오류:', error);
          return;
        }

        console.log('📋 현재 세션:', session);
        setSession(session);
        setUser(session?.user ?? null);
        console.log('👤 사용자 설정:', session?.user ?? null);
      } catch (error) {
        console.error('💥 세션 예외:', error);
      } finally {
        setIsLoading(false);
        console.log('⚡ 로딩 완료');
      }
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 Auth 상태 변경:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};