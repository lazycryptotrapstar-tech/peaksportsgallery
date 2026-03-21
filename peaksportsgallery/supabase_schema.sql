-- ============================================================
-- SIMPLE GENIUS — SUPABASE SCHEMA
-- Run this in: supabase.com → SQL Editor → New Query
-- ============================================================

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  mascot TEXT,
  mascot_name TEXT,
  conference TEXT,
  location TEXT,
  tier TEXT,
  enrollment INTEGER,
  colors JSONB,
  agent JSONB,
  venue JSONB,
  vip TEXT[],
  rivals TEXT[],
  sponsors TEXT[],
  emoji TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table (CRM)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  school_id TEXT REFERENCES schools(id),
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'Standard',
  status TEXT DEFAULT 'cold',
  tags TEXT[],
  notes TEXT,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets inventory
CREATE TABLE IF NOT EXISTS ticket_sections (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES schools(id),
  sport TEXT NOT NULL,
  section_label TEXT,
  zone TEXT,
  name TEXT,
  price DECIMAL(10,2),
  capacity INTEGER,
  status TEXT DEFAULT 'LOW',
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT REFERENCES schools(id),
  fan_name TEXT,
  fan_email TEXT,
  section_id TEXT,
  sport TEXT,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  membership_tier TEXT DEFAULT 'standard',
  campaign TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT REFERENCES schools(id),
  contact_id INTEGER REFERENCES contacts(id),
  campaign_type TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsorship packages
CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id SERIAL PRIMARY KEY,
  school_id TEXT REFERENCES schools(id),
  package_tier TEXT,
  package_name TEXT,
  sport TEXT DEFAULT 'Multi-Sport',
  annual_price DECIMAL(10,2),
  contract_years INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Available',
  highlights TEXT[],
  remaining_spots INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (enable for production)
-- ============================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_packages ENABLE ROW LEVEL SECURITY;

-- Public read for demo (tighten for production)
CREATE POLICY "Public read" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read" ON ticket_sections FOR SELECT USING (true);
CREATE POLICY "Public read" ON sponsorship_packages FOR SELECT USING (true);

-- ============================================================
-- SEED: Wofford sponsorship packages
-- ============================================================
INSERT INTO sponsorship_packages (school_id, package_tier, package_name, sport, annual_price, highlights, remaining_spots, status)
VALUES
  ('wofford', 'Bronze', 'Terrier Bronze', 'Football', 2500, ARRAY['10 PA mentions/game', '4 digital rotations/game', '4 season tickets'], 3, 'Available'),
  ('wofford', 'Silver', 'Terrier Silver', 'Multi-Sport', 6000, ARRAY['20 PA mentions/game', '8 digital rotations/game', 'Fixed signage', '8 season tickets', '4 social posts'], 2, 'Available'),
  ('wofford', 'Gold', 'Terrier Gold', 'Multi-Sport', 15000, ARRAY['Presenting sponsor 1 game', '15 digital rotations', 'Premium signage', '16 season tickets', '12 social posts', 'Mungo Room access'], 1, 'Available'),
  ('wofford', 'Presenting', 'Terrier Presenting', 'Multi-Sport', 42000, ARRAY['Naming opportunity', 'All digital assets', 'Full venue signage', '30 season tickets', 'Unlimited social', 'Suite access all games'], 1, 'Renewal Due');
