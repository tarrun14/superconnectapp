-- Add access control columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS view_access TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS post_access TEXT DEFAULT 'all';

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);

-- Create project_access_requests table
CREATE TABLE IF NOT EXISTS project_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(project_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS project_access_requests_project_id_idx ON project_access_requests(project_id);
CREATE INDEX IF NOT EXISTS project_access_requests_user_id_idx ON project_access_requests(user_id);
