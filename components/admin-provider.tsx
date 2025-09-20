'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdminLoggedIn: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 관리자 계정 정보
  const ADMIN_CREDENTIALS = {
    id: 'psckmc',
    password: 'dntjdktx506'
  };

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 관리자 로그인 상태 확인
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken === 'jjr_admin_authenticated') {
      setIsAdminLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = (id: string, password: string): boolean => {
    console.log('🔑 관리자 로그인 시도:', { id });

    if (id === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('admin_token', 'jjr_admin_authenticated');
      console.log('✅ 관리자 로그인 성공');
      return true;
    } else {
      console.log('❌ 관리자 로그인 실패: 잘못된 자격증명');
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 관리자 로그아웃');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('admin_token');
  };

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}