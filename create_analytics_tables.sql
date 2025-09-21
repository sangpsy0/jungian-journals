-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    avatar_url text,
    is_premium boolean DEFAULT false,
    premium_expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 방문 기록 테이블
CREATE TABLE IF NOT EXISTS public.visit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    session_id text,
    page_path text,
    referrer text,
    user_agent text,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- 콘텐츠 조회수 테이블
CREATE TABLE IF NOT EXISTS public.content_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL,
    content_type text NOT NULL, -- 'video' or 'blog'
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    session_id text,
    view_duration integer, -- in seconds
    completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 결제 내역 테이블
CREATE TABLE IF NOT EXISTS public.payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    amount decimal(10, 2) NOT NULL,
    currency text DEFAULT 'KRW',
    payment_method text,
    payment_status text DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_gateway text, -- tosspayments, stripe, etc
    gateway_transaction_id text,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- 구독 관리 테이블
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_type text DEFAULT 'free', -- free, premium, pro
    status text DEFAULT 'active', -- active, cancelled, expired
    started_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- user_profiles 정책
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- visit_logs 정책 (누구나 기록 가능, 관리자만 조회)
CREATE POLICY "Anyone can insert visit logs" ON public.visit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view visit logs" ON public.visit_logs
    FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com'); -- 관리자 이메일로 변경 필요

-- content_views 정책
CREATE POLICY "Anyone can insert content views" ON public.content_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view content views" ON public.content_views
    FOR SELECT USING (true);

-- payment_history 정책
CREATE POLICY "Users can view own payments" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments" ON public.payment_history
    FOR INSERT WITH CHECK (true);

-- subscriptions 정책
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_visit_logs_created_at ON public.visit_logs(created_at DESC);
CREATE INDEX idx_visit_logs_user_id ON public.visit_logs(user_id);
CREATE INDEX idx_content_views_content ON public.content_views(content_id, content_type);
CREATE INDEX idx_content_views_created_at ON public.content_views(created_at DESC);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(payment_status);