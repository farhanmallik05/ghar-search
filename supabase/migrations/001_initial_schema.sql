-- ==============================================================================
-- Ghar Search — Supabase Postgres Initial Schema Migration
-- Version: 001_initial_schema.sql
-- HackIIITD 2026 | Target Region: ap-south-1 (Mumbai)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Properties Table
-- Stores user-submitted or auto-discovered property listings
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    address TEXT NOT NULL,
    rera_id TEXT,
    state TEXT,
    city TEXT,
    promoter_name TEXT,
    project_name TEXT,
    listing_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reports Table
-- Master dossier container for every verification run
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'hitl_required')),
    trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100),
    trust_label TEXT CHECK (trust_label IN ('High Trust', 'Moderate Risk', 'High Risk', 'Critical Alert', 'Pending')),
    summary JSONB DEFAULT '{}'::jsonb,
    pdf_url TEXT,
    credits_consumed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Report Checks Table
-- Granular evidence records for each of the 6 parallel LangGraph checks
CREATE TABLE IF NOT EXISTS public.report_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    check_type TEXT NOT NULL CHECK (check_type IN (
        'rera_status',
        'claim_match',
        'promoter_record',
        'court_signals',
        'approvals',
        'reputation'
    )),
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'running',
        'passed',
        'flagged',
        'failed',
        'timeout',
        'needs_review'
    )),
    score_contribution INTEGER DEFAULT 0,
    findings JSONB DEFAULT '[]'::jsonb,
    evidence JSONB DEFAULT '[]'::jsonb,
    credits_used INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Watchlist Table
-- Properties tracked for nightly background due-diligence re-verification
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    alert_threshold INTEGER DEFAULT 10,
    notify_email BOOLEAN DEFAULT TRUE,
    notify_webhook TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    next_check_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, property_id)
);

-- 6. Human-in-the-Loop (HITL) Tasks Table
-- Captcha challenges or ambiguous checks paused awaiting human resolution
CREATE TABLE IF NOT EXISTS public.hitl_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    check_type TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('captcha', 'otp', 'manual_review', 'document_upload')),
    challenge_url TEXT,
    challenge_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'expired')),
    resolved_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 7. Agent Observability Logs Table
-- Structured JSON execution tracing per agent node
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    node TEXT NOT NULL,
    tool_used TEXT,
    credits_spent INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Indexes for Rapid Querying
CREATE INDEX IF NOT EXISTS idx_properties_rera_id ON public.properties(rera_id);
CREATE INDEX IF NOT EXISTS idx_reports_property_id ON public.reports(property_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_report_checks_report_id ON public.report_checks(report_id);
CREATE INDEX IF NOT EXISTS idx_report_checks_type_status ON public.report_checks(check_type, status);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_hitl_tasks_report_status ON public.hitl_tasks(report_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_logs_report_id ON public.agent_logs(report_id);

-- 9. Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitl_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read of reports & checks for verification sharing (token/id-based)
CREATE POLICY "Public can view reports by id" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Public can view report checks by report id" ON public.report_checks
    FOR SELECT USING (true);

CREATE POLICY "Public can view properties" ON public.properties
    FOR SELECT USING (true);

-- Service role bypasses RLS for worker writes
-- Authenticated users manage their own watchlist
CREATE POLICY "Users can manage their watchlist" ON public.watchlist
    FOR ALL USING (auth.uid() = user_id);

-- 10. Realtime Publications
-- Enable Realtime broadcasting for live progress in the Experience Layer
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.report_checks;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hitl_tasks;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
