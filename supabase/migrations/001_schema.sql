-- =====================================================
-- Ghar Search — Supabase Schema Migration (MVP)
-- Run this in Supabase SQL Editor before starting dev
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid,                          -- nullable for anonymous demo usage
  property_url text,
  rera_id      text,
  state        text DEFAULT 'maharashtra',
  status       text DEFAULT 'pending',        -- pending | running | done | failed
  trust_score  integer,
  score_band   text,                          -- LOW_RISK | MODERATE | HIGH_RISK | CRITICAL
  summary      text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS check_runs (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id    uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  check_type   text NOT NULL,                 -- 'rera' | 'litigation'
  status       text DEFAULT 'pending',        -- pending | running | done | failed | timeout
  score        integer DEFAULT 0,
  evidence     jsonb DEFAULT '[]',            -- [{url, screenshot_url, raw_text, timestamp}]
  flags        jsonb DEFAULT '[]',            -- [{severity, message, source_url}]
  raw_data     jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS check_runs_report_id_idx ON check_runs(report_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);

-- =====================================================
-- ROW-LEVEL SECURITY
-- MVP: open read for demo (no auth required)
-- Tighten after hackathon
-- =====================================================

ALTER TABLE reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_runs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (demo mode)
CREATE POLICY "anon_read_reports" ON reports
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_check_runs" ON check_runs
  FOR SELECT TO anon USING (true);

-- Service role can do everything (worker uses service key)
CREATE POLICY "service_all_reports" ON reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_all_check_runs" ON check_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE check_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- =====================================================
-- DEMO FIXTURES (3 pre-seeded properties)
-- Run AFTER schema creation
-- =====================================================

-- Fixture 1: CLEAN property (high trust score)
INSERT INTO reports (id, property_url, rera_id, state, status, trust_score, score_band, summary)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'https://demo.gharsearch.in/property/prestige-lakeside',
  'P52100048765',
  'maharashtra',
  'done',
  85,
  'LOW_RISK',
  'RERA registration is valid and active. No litigation signals found. This property shows strong compliance indicators.'
) ON CONFLICT DO NOTHING;

INSERT INTO check_runs (report_id, check_type, status, score, evidence, flags, raw_data)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'rera', 'done', 60, 
   '[{"url": "https://maharera.mahaonline.gov.in/", "raw_text": "Project: Prestige Lakeside | Status: Registered | Expiry: 2027-06-30 | Promoter: Prestige Group", "timestamp": "2026-10-24T04:00:00Z"}]',
   '[]',
   '{"rera_status": "registered", "promoter_name": "Prestige Group", "registration_expiry": "2027-06-30", "project_name": "Prestige Lakeside"}'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'litigation', 'done', 25,
   '[{"url": "https://www.google.com/search?q=Prestige+Lakeside+litigation", "raw_text": "No significant legal cases found for this project.", "timestamp": "2026-10-24T04:00:30Z"}]',
   '[]',
   '{"cases_found": 0, "search_query": "Prestige Lakeside maharashtra RERA litigation court case"}')
ON CONFLICT DO NOTHING;

-- Fixture 2: HIGH RISK property (expired RERA + litigation)
INSERT INTO reports (id, property_url, rera_id, state, status, trust_score, score_band, summary)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'https://demo.gharsearch.in/property/sunrise-heights',
  'P52100012399',
  'maharashtra',
  'done',
  28,
  'CRITICAL',
  'RERA registration has expired and not been renewed. Multiple consumer court cases found against the promoter. Exercise extreme caution.'
) ON CONFLICT DO NOTHING;

INSERT INTO check_runs (report_id, check_type, status, score, evidence, flags, raw_data)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000002', 'rera', 'done', 0,
   '[{"url": "https://maharera.mahaonline.gov.in/", "raw_text": "Project: Sunrise Heights | Status: EXPIRED | Expiry: 2024-03-31 | Promoter: Sunrise Builders Pvt Ltd", "timestamp": "2026-10-24T04:00:00Z"}]',
   '[{"severity": "critical", "message": "RERA registration EXPIRED on 2024-03-31. Project is legally non-compliant.", "source_url": "https://maharera.mahaonline.gov.in/"}]',
   '{"rera_status": "expired", "promoter_name": "Sunrise Builders Pvt Ltd", "registration_expiry": "2024-03-31", "project_name": "Sunrise Heights"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'litigation', 'done', 28,
   '[{"url": "https://consumercourt.in/cases/sunrise-builders", "raw_text": "3 consumer forum cases filed against Sunrise Builders Pvt Ltd for delayed possession.", "timestamp": "2026-10-24T04:00:30Z"}]',
   '[{"severity": "high", "message": "3 consumer forum cases found against promoter for delayed possession.", "source_url": "https://consumercourt.in/cases/sunrise-builders"}]',
   '{"cases_found": 3, "search_query": "Sunrise Builders Pvt Ltd maharashtra court case litigation consumer forum"}')
ON CONFLICT DO NOTHING;

-- Fixture 3: MODERATE risk property (valid RERA, minor litigation signals)
INSERT INTO reports (id, property_url, rera_id, state, status, trust_score, score_band, summary)
VALUES (
  'cccccccc-0000-0000-0000-000000000003',
  'https://demo.gharsearch.in/property/green-valley',
  'P52100031122',
  'maharashtra',
  'done',
  62,
  'MODERATE',
  'RERA registration is valid. One consumer complaint found but project is active. Review the flagged litigation before proceeding.'
) ON CONFLICT DO NOTHING;

INSERT INTO check_runs (report_id, check_type, status, score, evidence, flags, raw_data)
VALUES
  ('cccccccc-0000-0000-0000-000000000003', 'rera', 'done', 60,
   '[{"url": "https://maharera.mahaonline.gov.in/", "raw_text": "Project: Green Valley | Status: Registered | Expiry: 2026-12-31 | Promoter: Green Realty Pvt Ltd", "timestamp": "2026-10-24T04:00:00Z"}]',
   '[{"severity": "warning", "message": "RERA registration expires in 2 months (2026-12-31). Verify renewal status.", "source_url": "https://maharera.mahaonline.gov.in/"}]',
   '{"rera_status": "registered", "promoter_name": "Green Realty Pvt Ltd", "registration_expiry": "2026-12-31", "project_name": "Green Valley"}'),
  ('cccccccc-0000-0000-0000-000000000003', 'litigation', 'done', 2,
   '[{"url": "https://consumercourt.in/cases/green-realty", "raw_text": "1 consumer complaint filed for delayed possession, case ongoing.", "timestamp": "2026-10-24T04:00:30Z"}]',
   '[{"severity": "warning", "message": "1 pending consumer complaint for delayed possession.", "source_url": "https://consumercourt.in/cases/green-realty"}]',
   '{"cases_found": 1, "search_query": "Green Realty Pvt Ltd maharashtra court case litigation"}')
ON CONFLICT DO NOTHING;
