-- Add business attributes, payment, parking, and accessibility options to restaurants table
-- Run this after creating the restaurants table
-- This script is safe to run multiple times (uses IF NOT EXISTS)

DO $$ 
BEGIN
  -- Add columns one by one to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'outdoor_seating') THEN
    ALTER TABLE restaurants ADD COLUMN outdoor_seating BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'live_music') THEN
    ALTER TABLE restaurants ADD COLUMN live_music BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'menu_for_children') THEN
    ALTER TABLE restaurants ADD COLUMN menu_for_children BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_cocktails') THEN
    ALTER TABLE restaurants ADD COLUMN serves_cocktails BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_dessert') THEN
    ALTER TABLE restaurants ADD COLUMN serves_dessert BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'serves_coffee') THEN
    ALTER TABLE restaurants ADD COLUMN serves_coffee BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'good_for_children') THEN
    ALTER TABLE restaurants ADD COLUMN good_for_children BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'allows_dogs') THEN
    ALTER TABLE restaurants ADD COLUMN allows_dogs BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'restroom') THEN
    ALTER TABLE restaurants ADD COLUMN restroom BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'good_for_groups') THEN
    ALTER TABLE restaurants ADD COLUMN good_for_groups BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'reservable') THEN
    ALTER TABLE restaurants ADD COLUMN reservable BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'dine_in') THEN
    ALTER TABLE restaurants ADD COLUMN dine_in BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'takeout') THEN
    ALTER TABLE restaurants ADD COLUMN takeout BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'delivery') THEN
    ALTER TABLE restaurants ADD COLUMN delivery BOOLEAN;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'payment_options') THEN
    ALTER TABLE restaurants ADD COLUMN payment_options JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'parking_options') THEN
    ALTER TABLE restaurants ADD COLUMN parking_options JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'accessibility_options') THEN
    ALTER TABLE restaurants ADD COLUMN accessibility_options JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'reviews') THEN
    ALTER TABLE restaurants ADD COLUMN reviews JSONB;
  END IF;
END $$;

-- Comments for documentation
COMMENT ON COLUMN restaurants.outdoor_seating IS 'Whether the restaurant has outdoor seating';
COMMENT ON COLUMN restaurants.live_music IS 'Whether the restaurant has live music';
COMMENT ON COLUMN restaurants.serves_cocktails IS 'Whether the restaurant serves cocktails';
COMMENT ON COLUMN restaurants.reservable IS 'Whether the restaurant accepts reservations';
COMMENT ON COLUMN restaurants.payment_options IS 'Payment options: { acceptsCreditCards, acceptsDebitCards, acceptsCashOnly, acceptsNfc }';
COMMENT ON COLUMN restaurants.parking_options IS 'Parking options: { paidParkingLot, paidStreetParking, valetParking, freeParkingLot, etc. }';
COMMENT ON COLUMN restaurants.accessibility_options IS 'Accessibility options: { wheelchairAccessibleEntrance, wheelchairAccessibleRestroom, wheelchairAccessibleSeating }';
COMMENT ON COLUMN restaurants.reviews IS 'Stored reviews from Google Places API for AI description generation';

