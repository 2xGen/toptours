-- Create admin_settings table for storing admin password
-- This is a simple password-based authentication system

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default admin password (change this to your desired password)
-- Password is stored as plain text for simplicity (you can hash it later if needed)
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'your-secure-password-here')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can read/write
CREATE POLICY "Service role can manage admin settings"
  ON admin_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

