'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  ArrowLeft,
  Key,
  Database,
  Shield,
  Globe,
  Mail,
  Server,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdmin } from '@/components/admin-provider';

interface SystemSettings {
  siteTitle: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  googleOAuthClientId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  tossPaymentsClientKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  maxUsersPerDay: number;
  sessionTimeout: number;
  backupFrequency: string;
  logLevel: string;
}

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  authentication: 'healthy' | 'warning' | 'error';
  payment: 'healthy' | 'warning' | 'error';
  email: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

export default function SystemSettings() {
  const router = useRouter();
  const { isAdminLoggedIn, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteTitle: 'Jungian Journals',
    siteDescription: 'Explore the depths of the psyche through Jungian analysis and AI-powered insights.',
    maintenanceMode: false,
    registrationEnabled: true,
    googleOAuthClientId: '*********************',
    supabaseUrl: 'https://*****.supabase.co',
    supabaseAnonKey: '*********************',
    tossPaymentsClientKey: 'test_ck_*********************',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'admin@jungianjournals.com',
    smtpPassword: '*********************',
    maxUsersPerDay: 100,
    sessionTimeout: 24,
    backupFrequency: 'daily',
    logLevel: 'info'
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    authentication: 'healthy',
    payment: 'healthy',
    email: 'warning',
    storage: 'healthy'
  });

  useEffect(() => {
    if (!isLoading && !isAdminLoggedIn) {
      router.push('/jjr');
    }
  }, [isAdminLoggedIn, isLoading, router]);

  const handleSave = () => {
    // 실제 환경에서는 API 호출로 설정 저장
    alert('설정이 저장되었습니다.');
  };

  const handleTestConnection = (service: string) => {
    // 실제 환경에서는 각 서비스 연결 테스트
    alert(`${service} 연결 테스트를 시작합니다.`);
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">정상</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">주의</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">오류</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/jjr/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">시스템 설정</h1>
              <p className="text-sm text-slate-600">사이트 설정, API 키 관리, 보안 설정</p>
            </div>
          </div>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>설정 저장</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* 시스템 상태 요약 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>시스템 상태</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                새로고침
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.database)}
                  <span className="text-sm font-medium">데이터베이스</span>
                </div>
                {getStatusBadge(systemStatus.database)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.authentication)}
                  <span className="text-sm font-medium">인증</span>
                </div>
                {getStatusBadge(systemStatus.authentication)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.payment)}
                  <span className="text-sm font-medium">결제</span>
                </div>
                {getStatusBadge(systemStatus.payment)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.email)}
                  <span className="text-sm font-medium">이메일</span>
                </div>
                {getStatusBadge(systemStatus.email)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.storage)}
                  <span className="text-sm font-medium">스토리지</span>
                </div>
                {getStatusBadge(systemStatus.storage)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border">
          {[
            { id: 'general', name: '일반 설정', icon: Settings },
            { id: 'security', name: '보안', icon: Shield },
            { id: 'api', name: 'API 키', icon: Key },
            { id: 'email', name: '이메일', icon: Mail },
            { id: 'system', name: '시스템', icon: Database }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 일반 설정 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사이트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">사이트 제목</label>
                  <Input
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    placeholder="사이트 제목"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">사이트 설명</label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    placeholder="사이트 설명"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사이트 기능</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">유지보수 모드</h4>
                    <p className="text-sm text-muted-foreground">사이트를 임시적으로 비활성화합니다</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">회원가입 허용</h4>
                    <p className="text-sm text-muted-foreground">새로운 사용자 등록을 허용합니다</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.registrationEnabled}
                      onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 보안 설정 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>보안 정책</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">일일 최대 가입자 수</label>
                  <Input
                    type="number"
                    value={settings.maxUsersPerDay}
                    onChange={(e) => setSettings({ ...settings, maxUsersPerDay: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">세션 만료 시간 (시간)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>관리자 계정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">보안 권장사항</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      관리자 비밀번호를 정기적으로 변경하고, 2단계 인증을 활성화하는 것을 권장합니다.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => alert('비밀번호 변경 기능은 추후 구현 예정입니다.')}>
                    비밀번호 변경
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API 키 설정 */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">API 키 관리</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showSecrets ? '숨기기' : '보기'}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Google OAuth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <div className="flex space-x-2">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.googleOAuthClientId}
                      onChange={(e) => setSettings({ ...settings, googleOAuthClientId: e.target.value })}
                    />
                    <Button variant="outline" onClick={() => handleTestConnection('Google OAuth')}>
                      테스트
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supabase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project URL</label>
                  <div className="flex space-x-2">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.supabaseUrl}
                      onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                    />
                    <Button variant="outline" onClick={() => handleTestConnection('Supabase')}>
                      테스트
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Anon Key</label>
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.supabaseAnonKey}
                    onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>TossPayments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client Key</label>
                  <div className="flex space-x-2">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.tossPaymentsClientKey}
                      onChange={(e) => setSettings({ ...settings, tossPaymentsClientKey: e.target.value })}
                    />
                    <Button variant="outline" onClick={() => handleTestConnection('TossPayments')}>
                      테스트
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 이메일 설정 */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">SMTP 서버</label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">포트</label>
                    <Input
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">사용자명</label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">비밀번호</label>
                  <div className="flex space-x-2">
                    <Input
                      type={showSecrets ? 'text' : 'password'}
                      value={settings.smtpPassword}
                      onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                    />
                    <Button variant="outline" onClick={() => handleTestConnection('SMTP')}>
                      테스트
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 시스템 설정 */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>백업 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">백업 주기</label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="hourly">매시간</option>
                    <option value="daily">매일</option>
                    <option value="weekly">매주</option>
                    <option value="monthly">매월</option>
                  </select>
                </div>
                <Button variant="outline" onClick={() => alert('수동 백업을 시작합니다.')}>
                  <Database className="h-4 w-4 mr-2" />
                  수동 백업 실행
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>로깅</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">로그 레벨</label>
                  <select
                    value={settings.logLevel}
                    onChange={(e) => setSettings({ ...settings, logLevel: e.target.value })}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>시스템 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">서버 시간:</span> {new Date().toLocaleString('ko-KR')}
                  </div>
                  <div>
                    <span className="font-medium">업타임:</span> 2일 14시간 32분
                  </div>
                  <div>
                    <span className="font-medium">Node.js 버전:</span> v18.17.0
                  </div>
                  <div>
                    <span className="font-medium">메모리 사용량:</span> 245MB / 1GB
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}