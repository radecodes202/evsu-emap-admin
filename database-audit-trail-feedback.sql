-- Migration script for Audit Trail and User Feedback features
-- Run this in Supabase SQL Editor

-- ============================================
-- AUDIT TRAIL SYSTEM
-- ============================================

-- Audit logs table to track all user actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'
  entity_type TEXT NOT NULL, -- 'building', 'location', 'route', 'user', 'auth', etc.
  entity_id UUID,
  old_values JSONB, -- Previous values (for UPDATE)
  new_values JSONB, -- New values (for CREATE/UPDATE)
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_email_idx ON audit_logs(user_email);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit logs (only admins/service role can view)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Public read audit_logs') THEN
    CREATE POLICY "Public read audit_logs" ON audit_logs FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Service role all audit_logs') THEN
    CREATE POLICY "Service role all audit_logs" ON audit_logs FOR ALL 
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- ============================================
-- USER FEEDBACK SYSTEM
-- ============================================

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Optional: if user is logged in
  user_email TEXT, -- Optional: if user provides email
  name TEXT, -- Optional: user's name
  category TEXT NOT NULL, -- 'bug', 'feature', 'suggestion', 'complaint', 'compliment'
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'closed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  admin_notes TEXT, -- Internal notes from admin
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Optional: 1-5 star rating
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user feedback
CREATE INDEX IF NOT EXISTS user_feedback_category_idx ON user_feedback(category);
CREATE INDEX IF NOT EXISTS user_feedback_status_idx ON user_feedback(status);
CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS user_feedback_user_email_idx ON user_feedback(user_email);

-- Enable Row Level Security
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for user feedback
DO $$
BEGIN
  -- Public can create feedback (submit)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Public insert user_feedback') THEN
    CREATE POLICY "Public insert user_feedback" ON user_feedback FOR INSERT WITH CHECK (true);
  END IF;
  
  -- Public can read their own feedback (if logged in)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Public read own user_feedback') THEN
    CREATE POLICY "Public read own user_feedback" ON user_feedback FOR SELECT 
      USING (user_id::text = auth.uid()::text OR user_email = auth.email());
  END IF;
  
  -- Service role can do everything (for admin panel)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Service role all user_feedback') THEN
    CREATE POLICY "Service role all user_feedback" ON user_feedback FOR ALL 
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Updated at trigger for user_feedback
DROP TRIGGER IF EXISTS user_feedback_updated_at ON user_feedback;
CREATE TRIGGER user_feedback_updated_at
BEFORE UPDATE ON user_feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUDIT LOGGING FUNCTION
-- ============================================

-- Function to log audit events (can be called from application)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action_type,
    entity_type,
    entity_id,
    old_values,
    new_values,
    description,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_user_email,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_description,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- You can add sample feedback if needed for testing
-- INSERT INTO user_feedback (category, subject, message, user_email) VALUES
--   ('suggestion', 'Add dark mode', 'It would be great to have a dark mode option', 'user@example.com');
