-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  topic TEXT NOT NULL,
  target_audience TEXT,
  tone TEXT,
  video_length INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  hook TEXT,
  body TEXT,
  cta TEXT,
  full_script TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  script_id UUID REFERENCES scripts(id),
  video_url TEXT NOT NULL,
  duration INTEGER,
  status TEXT DEFAULT 'processing',
  provider TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content outputs table
CREATE TABLE IF NOT EXISTS content_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_text TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ad accounts table (for Facebook/Google OAuth)
CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT NOT NULL DEFAULT '',
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  ad_account_id UUID REFERENCES ad_accounts(id),
  project_id UUID REFERENCES projects(id),
  platform TEXT NOT NULL,
  platform_campaign_id TEXT,
  campaign_name TEXT NOT NULL,
  objective TEXT,
  status TEXT DEFAULT 'draft',
  daily_budget DECIMAL,
  lifetime_budget DECIMAL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  targeting JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign metrics table
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr DECIMAL,
  cpc DECIMAL,
  cpm DECIMAL,
  cpa DECIMAL,
  roas DECIMAL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Campaign alerts table
CREATE TABLE IF NOT EXISTS campaign_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  campaign_id UUID REFERENCES campaigns(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ad creatives table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  creative_type TEXT NOT NULL,
  primary_text TEXT,
  headline TEXT,
  description TEXT,
  cta TEXT,
  media_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
