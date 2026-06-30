-- Drop the unique constraint on project_id and user_id to allow re-requesting access
ALTER TABLE project_access_requests DROP CONSTRAINT IF EXISTS project_access_requests_project_id_user_id_key;
