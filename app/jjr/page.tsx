'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

export default function AdminLogin() {
  const router = useRouter();
  const { isAdminLoggedIn, login, isLoading } = useAdmin();
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isAdminLoggedIn) {
      router.push('/jjr/dashboard');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    console.log('📝 관리자 로그인 폼 제출:', { id: formData.id });

    if (!formData.id || !formData.password) {
      setError('ID와 비밀번호를 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    const success = login(formData.id, formData.password);

    if (success) {
      console.log('🎉 로그인 성공, 대시보드로 이동');
      router.push('/jjr/dashboard');
    } else {
      setError('ID 또는 비밀번호가 올바르지 않습니다.');
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (error) {
      setError('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">관리자 로그인</CardTitle>
          <p className="text-muted-foreground">
            시스템 관리자 권한으로 로그인하세요
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">관리자 ID</Label>
              <Input
                id="id"
                name="id"
                type="text"
                value={formData.id}
                onChange={handleInputChange}
                placeholder="관리자 ID를 입력하세요"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isSubmitting}
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-primary"
            >
              ← 메인 페이지로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}