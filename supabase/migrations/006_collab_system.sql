-- =============================================
-- COLLAB SYSTEM MIGRATION
-- Run in Supabase SQL Editor
-- =============================================

-- 1. CREATE collab_requests TABLE
CREATE TABLE IF NOT EXISTS collab_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  commitment TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE collab_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all open collab_requests (and their own closed ones)
CREATE POLICY "Anyone can read open collab_requests"
  ON collab_requests FOR SELECT
  USING (status = 'open' OR auth.uid() = creator_id);

-- Authenticated users can insert their own collab_requests
CREATE POLICY "Users can create collab_requests"
  ON collab_requests FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own collab_requests
CREATE POLICY "Creators can update own collab_requests"
  ON collab_requests FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their own collab_requests
CREATE POLICY "Creators can delete own collab_requests"
  ON collab_requests FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- 2. CREATE collab_interests TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS collab_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collab_request_id UUID NOT NULL REFERENCES collab_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collab_request_id, user_id)
);

ALTER TABLE collab_interests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own interests
CREATE POLICY "Users can insert own collab_interests"
  ON collab_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own interests; creators can see interests on their requests
CREATE POLICY "Creators and users can read interests"
  ON collab_interests FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = (
      SELECT creator_id FROM collab_requests WHERE id = collab_request_id
    )
  );

-- =============================================
-- 3. ADD collab_request_id TO notifications
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'collab_request_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN collab_request_id UUID REFERENCES collab_requests(id) ON DELETE SET NULL;
  END IF;
END $$;
