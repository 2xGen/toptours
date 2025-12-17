"-- RLS Policies for viator_tag_traits table
-- This table should be publicly readable (tag classification data is not sensitive)

-- Enable RLS
ALTER TABLE viator_tag_traits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (tag traits are not sensitive data)
CREATE POLICY "Allow public read access to tag traits"
ON viator_tag_traits
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to read (redundant but explicit)
CREATE POLICY "Allow authenticated users to read tag traits"
ON viator_tag_traits
FOR SELECT
TO authenticated
USING (true);

-- Note: INSERT/UPDATE/DELETE should remain restricted to service role
-- Only the classification script should modify this data

"