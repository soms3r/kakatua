-- Kakatua Database Init Migration (0001_init_schema.sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create triggers to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create USERS Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    native_languages TEXT[] NOT NULL,
    learning_languages TEXT[] NOT NULL,
    interests TEXT[] NOT NULL,
    timezone_offset NUMERIC(4, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'searching', 'suspended', 'banned')),
    suspension_until TIMESTAMP WITH TIME ZONE,
    report_count INTEGER DEFAULT 0 NOT NULL CHECK (report_count >= 0),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Triggers for users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2. Create CULTURE_CARDS Table (1:1 with users)
CREATE TABLE IF NOT EXISTS culture_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Triggers for culture_cards
CREATE TRIGGER update_culture_cards_updated_at
BEFORE UPDATE ON culture_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Create MISSIONS Table (Master data)
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    exp_reward INTEGER NOT NULL CHECK (exp_reward >= 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'weekly', 'milestone')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Triggers for missions
CREATE TRIGGER update_missions_updated_at
BEFORE UPDATE ON missions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Create USER_MISSIONS Table (1:M with users, tracks progress)
CREATE TABLE IF NOT EXISTS user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT user_mission_unique UNIQUE (user_id, mission_id)
);

-- Triggers for user_missions
CREATE TRIGGER update_user_missions_updated_at
BEFORE UPDATE ON user_missions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Create REPORTS Table (Audit logs, unique reporter-reported pairs)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT reporter_reported_unique UNIQUE (reporter_id, reported_id)
);

-- Triggers for reports
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==========================================

-- GIN Indexes on languages arrays for fast overlap (&&) searches (Find a Kakatua)
CREATE INDEX IF NOT EXISTS idx_users_native_languages ON users USING GIN (native_languages);
CREATE INDEX IF NOT EXISTS idx_users_learning_languages ON users USING GIN (learning_languages);

-- Index on report count and status to optimize ban audits and queue filtering
CREATE INDEX IF NOT EXISTS idx_users_report_count ON users (report_count);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Foreign Key index for counting reports on a user quickly
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports (reported_id);
