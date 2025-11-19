-- Make display_name unique in profiles table
-- This prevents duplicate names in leaderboards and ensures each user has a unique identity

-- First, handle any existing duplicates by appending a number
-- (This is a one-time cleanup - you may want to review duplicates first)
DO $$
DECLARE
    dup_name TEXT;
    rec RECORD;
    counter INTEGER;
    new_name TEXT;
BEGIN
    -- Find all duplicate display names
    FOR dup_name IN 
        SELECT display_name 
        FROM profiles 
        WHERE display_name IS NOT NULL 
        AND display_name != ''
        GROUP BY display_name 
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        -- For each duplicate name, keep the first one and append numbers to the rest
        FOR rec IN 
            SELECT id, display_name 
            FROM profiles 
            WHERE display_name = dup_name 
            ORDER BY created_at
        LOOP
            IF counter > 1 THEN
                -- Try to find an available number
                new_name := rec.display_name || counter::TEXT;
                -- Check if this name already exists, if so, increment
                WHILE EXISTS (SELECT 1 FROM profiles WHERE display_name = new_name) LOOP
                    counter := counter + 1;
                    new_name := rec.display_name || counter::TEXT;
                END LOOP;
                
                UPDATE profiles 
                SET display_name = new_name 
                WHERE id = rec.id;
                
                counter := counter + 1;
            ELSE
                -- First occurrence, keep as is
                counter := counter + 1;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Add unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_display_name_unique UNIQUE (display_name);

