/**
 * Prefilled Tips System for Travel Plans
 * Users can select from these predefined tips (no moderation needed)
 */

import { 
  Sunrise, 
  Sun, 
  Moon, 
  Sunset, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Footprints, 
  Camera, 
  Users,
  Clock,
  MapPin,
  UtensilsCrossed,
  Car,
  Plane
} from 'lucide-react';

export const PLAN_TIPS = {
  timing: [
    { id: 'morning', label: 'Best in the morning', icon: Sunrise },
    { id: 'afternoon', label: 'Perfect for afternoon', icon: Sun },
    { id: 'evening', label: 'Great for evening', icon: Moon },
    { id: 'sunset', label: 'Sunset experience', icon: Sunset },
    { id: 'early-morning', label: 'Early morning recommended', icon: Sunrise },
    { id: 'late-night', label: 'Late night option', icon: Moon },
  ],
  booking: [
    { id: 'reserve-ahead', label: 'Reserve ahead', icon: Calendar },
    { id: 'walk-in-ok', label: 'Walk-in friendly', icon: CheckCircle },
    { id: 'popular', label: 'Very popular', icon: TrendingUp },
    { id: 'book-early', label: 'Book early (sells out)', icon: Calendar },
    { id: 'flexible', label: 'Flexible timing', icon: Clock },
  ],
  reasons: [
    { id: 'must-see', label: 'Must-see experience', icon: TrendingUp },
    { id: 'hidden-gem', label: 'Hidden gem', icon: MapPin },
    { id: 'best-value', label: 'Best value for money', icon: DollarSign },
    { id: 'top-rated', label: 'Top-rated by travelers', icon: CheckCircle },
    { id: 'unique', label: 'Unique experience', icon: Camera },
    { id: 'local-favorite', label: 'Local favorite', icon: Users },
    { id: 'instagram-worthy', label: 'Instagram-worthy', icon: Camera },
    { id: 'once-in-lifetime', label: 'Once-in-a-lifetime', icon: Sun },
    { id: 'great-reviews', label: 'Amazing reviews', icon: CheckCircle },
    { id: 'skip-the-line', label: 'Skip the line', icon: Clock },
    { id: 'all-inclusive', label: 'All-inclusive', icon: CheckCircle },
    { id: 'small-group', label: 'Small group experience', icon: Users },
    { id: 'private-option', label: 'Private option available', icon: Users },
    { id: 'free-cancellation', label: 'Free cancellation', icon: CheckCircle },
    { id: 'instant-confirmation', label: 'Instant confirmation', icon: CheckCircle },
    { id: 'best-photos', label: 'Best photo opportunities', icon: Camera },
    { id: 'authentic', label: 'Authentic local experience', icon: MapPin },
    { id: 'bucket-list', label: 'Bucket list item', icon: TrendingUp },
    { id: 'award-winning', label: 'Award-winning', icon: CheckCircle },
    { id: 'perfect-for-first-timers', label: 'Perfect for first-timers', icon: Users },
  ],
  tips: [
    { id: 'bring-cash', label: 'Bring cash', icon: DollarSign },
    { id: 'wear-comfortable', label: 'Wear comfortable shoes', icon: Footprints },
    { id: 'bring-camera', label: 'Photo opportunity', icon: Camera },
    { id: 'family-friendly', label: 'Family friendly', icon: Users },
    { id: 'romantic', label: 'Romantic setting', icon: Users },
    { id: 'adventure', label: 'Adventure activity', icon: Footprints },
    { id: 'relaxing', label: 'Relaxing experience', icon: Sun },
    { id: 'cultural', label: 'Cultural experience', icon: MapPin },
  ],
  dining: [
    { id: 'dinner', label: 'Great for dinner', icon: UtensilsCrossed },
    { id: 'lunch', label: 'Perfect for lunch', icon: UtensilsCrossed },
    { id: 'breakfast', label: 'Breakfast spot', icon: UtensilsCrossed },
    { id: 'casual', label: 'Casual dining', icon: UtensilsCrossed },
    { id: 'fine-dining', label: 'Fine dining', icon: UtensilsCrossed },
    { id: 'outdoor', label: 'Outdoor seating', icon: Sun },
    { id: 'waterfront', label: 'Waterfront location', icon: MapPin },
    { id: 'best-food', label: 'Best food in area', icon: UtensilsCrossed },
    { id: 'local-cuisine', label: 'Authentic local cuisine', icon: UtensilsCrossed },
    { id: 'romantic-dining', label: 'Romantic dining', icon: UtensilsCrossed },
    { id: 'great-views', label: 'Amazing views', icon: Camera },
    { id: 'live-music', label: 'Live music', icon: Users },
  ],
  transportation: [
    { id: 'walking', label: 'Walking distance', icon: Footprints },
    { id: 'driving', label: 'Driving required', icon: Car },
    { id: 'transport-included', label: 'Transport included', icon: Car },
    { id: 'airport-nearby', label: 'Near airport', icon: Plane },
  ],
};

/**
 * Get all tips as a flat array
 */
export function getAllTips() {
  return Object.values(PLAN_TIPS).flat();
}

/**
 * Get tips by category
 */
export function getTipsByCategory(category) {
  return PLAN_TIPS[category] || [];
}

/**
 * Get tip by ID
 */
export function getTipById(tipId) {
  return getAllTips().find(tip => tip.id === tipId);
}

/**
 * Get suggested tips based on item type
 */
export function getSuggestedTipsForItem(itemType) {
  const suggestions = {
    tour: [
      ...PLAN_TIPS.reasons,
      ...PLAN_TIPS.timing,
      ...PLAN_TIPS.booking,
      ...PLAN_TIPS.tips,
      ...PLAN_TIPS.transportation,
    ],
    restaurant: [
      ...PLAN_TIPS.reasons,
      ...PLAN_TIPS.dining,
      ...PLAN_TIPS.timing.filter(t => ['evening', 'afternoon', 'sunset'].includes(t.id)),
      ...PLAN_TIPS.booking,
      ...PLAN_TIPS.tips.filter(t => ['romantic', 'family-friendly'].includes(t.id)),
    ],
  };
  
  return suggestions[itemType] || getAllTips();
}

