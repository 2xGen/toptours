'use client';

import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Price Calculator Component - Simplified
 * 
 * Uses pricing from search API (pricing.summary.fromPrice) for base price
 * Simple traveler count (no age bands)
 * Group pricing shows fixed price
 */
export default function PriceCalculator({ tour, viatorBookingUrl, pricing, pricingPerAgeBand = null, travelers: externalTravelers, setTravelers: externalSetTravelers }) {
  const pricingInfo = tour?.pricingInfo;
  const pricingType = pricingInfo?.type || 'PER_PERSON';
  
  // Check if this is a group/private tour (UNIT type = group pricing, not per-person)
  const isGroupPricing = pricingType === 'UNIT';

  // For UNIT pricing, find max travelers from TRAVELER age band
  const ageBands = pricingInfo?.ageBands || [];
  const travelerBand = ageBands.find(band => band.ageBand === 'TRAVELER');
  const maxTravelers = travelerBand?.maxTravelersPerBooking || null;

  // Get base price - use original pricing from product/search API
  const fromPrice = pricing ||
                    tour?.pricing?.summary?.fromPrice || 
                    tour?.pricingInfo?.fromPrice ||
                    tour?.pricing?.fromPrice ||
                    tour?.price ||
                    0;

  // Simple traveler count (for per-person pricing)
  const [localTravelerCount, setLocalTravelerCount] = useState(1);
  
  // Use external travelers if provided (for synchronization), otherwise use local
  // For simplified version, we'll use a single number instead of object
  const travelerCount = externalTravelers !== undefined && typeof externalTravelers === 'object' 
    ? Object.values(externalTravelers).reduce((sum, count) => sum + (count || 0), 0) || 1
    : externalTravelers !== undefined && typeof externalTravelers === 'number'
    ? externalTravelers
    : localTravelerCount;
  
  const setTravelerCount = (count) => {
    const newCount = Math.max(1, Math.min(20, count)); // Limit between 1 and 20
    setLocalTravelerCount(newCount);
    
    // If external setTravelers is provided, update it (convert to object format for compatibility)
    if (externalSetTravelers) {
      // For simplified version, we'll just set ADULT count
      externalSetTravelers({ ADULT: newCount });
    }
  };

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    if (isGroupPricing) {
      // Group pricing: fixed price regardless of travelers
      return fromPrice;
    }
    
    // Per-person pricing: fromPrice × traveler count
    return fromPrice * travelerCount;
  }, [fromPrice, travelerCount, isGroupPricing]);

  // Show component even if price is missing - let Viator handle it
  if (fromPrice === undefined || fromPrice === null) {
    return null; // Only hide if price is completely missing
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6 md:p-8">
        {/* Price Header */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            From ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {!isGroupPricing && (
            <div className="text-sm text-gray-600">per person</div>
          )}
          {isGroupPricing && maxTravelers && (
            <div className="text-sm text-gray-600">group price for up to {maxTravelers} travelers</div>
          )}
          {isGroupPricing && !maxTravelers && (
            <div className="text-sm text-gray-600">group price</div>
          )}
        </div>

        {/* Travelers Section - Only show for per-person pricing */}
        {!isGroupPricing && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Travelers
            </label>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-700">Number of travelers</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTravelerCount(travelerCount - 1)}
                  disabled={travelerCount <= 1}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-gray-900">{travelerCount}</span>
                <button
                  onClick={() => setTravelerCount(travelerCount + 1)}
                  disabled={travelerCount >= 20}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Total - Show when travelers are selected */}
        {!isGroupPricing && travelerCount > 0 && estimatedTotal > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Estimated Total:</span>
              <span className="text-xl font-bold text-gray-900">
                ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Final price may vary. Check availability for exact pricing.
            </p>
          </div>
        )}

        {/* Group Pricing Total */}
        {isGroupPricing && fromPrice > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Price:</span>
              <span className="text-xl font-bold text-gray-900">
                ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          asChild
          className="w-full bg-[#00AA6C] hover:bg-[#008855] text-white font-semibold py-6 text-base"
        >
          <a
            href={viatorBookingUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Check Availability
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
