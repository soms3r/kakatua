-- Kakatua Database Migration 0002: Feedbacks Table

-- 6. Create FEEDBACKS Table (Flock Feedback system)
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Bug', 'Idea', 'FeatureRequest', 'Other')),
    contact_info TEXT,
    status VARCHAR(20) DEFAULT 'New' NOT NULL CHECK (status IN ('New', 'Reviewing', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for querying feedbacks by status
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks (status);

-- Index for filtering by category (e.g., export FeatureRequests to GitHub)
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks (category);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
