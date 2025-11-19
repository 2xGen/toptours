-- Add trip_preferences column to profiles table
-- This stores user trip preferences as JSONB for AI tour matching

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trip_preferences JSONB DEFAULT NULL;

-- Add a comment to document the structure
COMMENT ON COLUMN profiles.trip_preferences IS 'User trip preferences for AI tour matching. Structure: {
  "travelerType": "solo" | "couple" | "family" | "friends" | "multi-gen" | "not_set",
  "adventureLevel": 0-100,
  "cultureVsBeach": 0-100,  -- Note: Actually "relaxation vs exploration" in UI
  "groupPreference": 0-100,
  "budgetComfort": 0-100,
  "structurePreference": 0-100,
  "foodAndDrinkInterest": 0-100,
  "familyFriendlyImportance": 0-100,
  "accessibilityImportance": 0-100,
  "timeOfDayPreference": "morning" | "afternoon" | "evening" | "no_preference",
  "maxPricePerPerson": number | null,
  "mustHaveFlags": string[],
  "avoidTags": string[]
}';

-- Optional: Create a GIN index for faster JSONB queries if you plan to search/filter by preferences
-- CREATE INDEX IF NOT EXISTS idx_profiles_trip_preferences ON profiles USING GIN (trip_preferences);

