'use client';

import { useState, useMemo } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Price Calculator Component - Viator Style
 * 
 * Uses pricing from search API (pricing.summary.fromPrice) for base price
 * Uses tour.pricingInfo.ageBands to calculate estimated total price
 * No API calls needed - uses existing product data
 */
export default function PriceCalculator({ tour, viatorBookingUrl, pricing, travelers: externalTravelers, setTravelers: externalSetTravelers }) {
  const pricingInfo = tour?.pricingInfo;
  const ageBands = pricingInfo?.ageBands || [];
  
  // Priority: pricing prop (from search API) > tour object pricing
  const fromPrice = 
    pricing ||
    tour?.pricing?.summary?.fromPrice || 
    tour?.pricingInfo?.fromPrice ||
    tour?.pricing?.fromPrice ||
    tour?.price ||
    0;
    
  const pricingType = pricingInfo?.type || 'PER_PERSON';
  
  // Check if this is a group/private tour (UNIT type = group pricing, not per-person)
  const isGroupPricing = pricingType === 'UNIT';

  // For UNIT pricing, find max travelers from TRAVELER age band
  const travelerBand = ageBands.find(band => band.ageBand === 'TRAVELER');
  const maxTravelers = travelerBand?.maxTravelersPerBooking || null;

  // Filter out weird age bands:
  // - "TRAVELER" age bands (used for group bookings, 0-120 years)
  // - Bands with unrealistic ranges (more than 50 years span, or ending at 120+)
  const validAgeBands = ageBands.filter(band => {
    // Filter out TRAVELER age bands (these are for group bookings)
    if (band.ageBand === 'TRAVELER') return false;
    
    const endAge = band.endAge || 99;
    const startAge = band.startAge || 0;
    
    // Filter out bands with unrealistic ranges
    return (endAge - startAge) <= 50 && endAge < 100;
  });

  // Check if there are child/youth/infant age bands (for discounted rates message)
  const hasChildRates = validAgeBands.some(band => 
    band.ageBand === 'CHILD' || 
    band.ageBand === 'INFANT' || 
    band.ageBand === 'YOUTH'
  );

  // Use shared travelers state if provided, otherwise use local state
  const [localTravelers, setLocalTravelers] = useState(() => {
    const initial = {};
    validAgeBands.forEach((band) => {
      initial[band.ageBand] = band.ageBand === 'ADULT' ? 1 : 0; // Default: 1 adult
    });
    return initial;
  });

  // Use external travelers if provided (for synchronization), otherwise use local
  const travelers = externalTravelers !== undefined ? externalTravelers : localTravelers;
  const setTravelers = externalSetTravelers || setLocalTravelers;
  
  // Check if any child/youth/infant travelers are currently selected
  const hasChildTravelersSelected = useMemo(() => {
    return validAgeBands.some(band => {
      const ageBand = band.ageBand;
      if (ageBand === 'CHILD' || ageBand === 'INFANT' || ageBand === 'YOUTH') {
        return (travelers[ageBand] || 0) > 0;
      }
      return false;
    });
  }, [travelers, validAgeBands]);

  // Calculate total travelers
  const totalTravelers = useMemo(() => {
    return Object.values(travelers).reduce((sum, count) => sum + (count || 0), 0);
  }, [travelers]);

  // Calculate estimated total price based on travelers
  // For per-person pricing, multiply base price by travelers
  // For group pricing, show base price (fixed for group)
  const estimatedTotal = useMemo(() => {
    if (isGroupPricing) {
      // Group pricing: fixed price regardless of travelers
      return fromPrice;
    }
    
    // Per-person pricing: estimate based on base price
    // Note: This is an estimate - actual pricing may vary by age band
    // Real pricing would require /availability/check API call
    if (totalTravelers === 0) {
      return 0;
    }
    
    // Simple estimate: base price × total travelers
    // In reality, children/infants might have different rates
    return fromPrice * totalTravelers;
  }, [fromPrice, totalTravelers, isGroupPricing]);

  // Update traveler count
  const updateTravelers = (ageBand, delta) => {
    setTravelers((prev) => {
      const current = prev[ageBand] || 0;
      const band = validAgeBands.find((b) => b.ageBand === ageBand);
      if (!band) return prev;

      const newCount = Math.max(
        band.minTravelersPerBooking || 0,
        Math.min(band.maxTravelersPerBooking || 9, current + delta)
      );

      return { ...prev, [ageBand]: newCount };
    });
  };

  // Get age band label
  const getAgeBandLabel = (ageBand) => {
    const labels = {
      INFANT: 'Infant',
      CHILD: 'Child',
      ADULT: 'Adult',
    };
    return labels[ageBand] || ageBand;
  };

  // Get age range text - cleaner display (hide if range is too wide/weird)
  const getAgeRangeText = (band) => {
    const ageBand = band.ageBand;
    const startAge = band.startAge || 0;
    const endAge = band.endAge || 99;
    
    // Don't show weird ranges like 0-120
    if (endAge >= 100) {
      return `${startAge}+ years`;
    }
    
    // Standard age ranges
    if (ageBand === 'INFANT') {
      if (startAge === 0 && endAge <= 2) return '0-2 years';
      if (startAge === 0 && endAge <= 4) return '0-4 years';
      if (endAge - startAge <= 5) return `${startAge}-${endAge} years`;
      return `${startAge}-${endAge} years`;
    }
    
    if (ageBand === 'CHILD') {
      if (startAge >= 2 && endAge <= 16) {
        if (endAge - startAge <= 12) return `${startAge}-${endAge} years`;
        return `${startAge}-${endAge} years`;
      }
      return `${startAge}-${endAge} years`;
    }
    
    if (ageBand === 'ADULT') {
      if (startAge >= 16 && endAge >= 99) return '16+ years';
      if (startAge === 16) return '16+ years';
      if (endAge >= 99) return `${startAge}+ years`;
      return `${startAge}-${endAge} years`;
    }
    
    // Fallback - hide if range is too wide
    if (endAge - startAge > 50) {
      return `${startAge}+ years`;
    }
    
    return `${startAge}-${endAge} years`;
  };

  // Show component even if ageBands are missing - we can still show the price
  // Always show if we have any price data, even if it's 0 (let Viator handle it)
  if (fromPrice === undefined || fromPrice === null) {
    return null; // Only hide if price is completely missing
  }

  // If no valid ageBands, we'll show a simplified version
  const hasAgeBands = validAgeBands && validAgeBands.length > 0;

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6 md:p-8">
        {/* Price Header - Viator Style */}
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
        {hasChildRates && !isGroupPricing && (
          <div className="text-sm text-gray-600 mt-1">Discounted rates for kids</div>
        )}
        
        {/* Message about checking availability for kids' discounted prices */}
        {(hasChildRates || hasChildTravelersSelected) && !isGroupPricing && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Kids' discounts available:</strong> Check availability to see exact discounted prices for children and youth.
            </p>
          </div>
        )}
        
        {/* Estimated Total - Show when travelers are selected */}
        {!isGroupPricing && totalTravelers > 0 && estimatedTotal > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Estimated Total:</span>
              <span className="text-xl font-bold text-gray-900">
                ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {hasChildTravelersSelected 
                ? "Estimated based on adult pricing. Check availability for exact kids' discounted prices."
                : "Final price may vary. Check availability for exact pricing."
              }
            </p>
          </div>
        )}
        
        {/* Group Pricing Total */}
        {isGroupPricing && fromPrice > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Price:</span>
              <span className="text-xl font-bold text-gray-900">
                ${fromPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Travelers Section - Only show if ageBands exist and not group pricing */}
      {hasAgeBands && !isGroupPricing && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Travelers
          </label>
          <div className="space-y-3">
            {validAgeBands.map((band) => {
            const count = travelers[band.ageBand] || 0;
            const min = band.minTravelersPerBooking || 0;
            const max = band.maxTravelersPerBooking || 9;

            return (
              <div key={band.ageBand} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {getAgeBandLabel(band.ageBand)}
                      </p>
                      <p className="text-xs text-gray-500">{getAgeRangeText(band)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateTravelers(band.ageBand, -1)}
                    disabled={count <= min}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900">{count}</span>
                  <button
                    onClick={() => updateTravelers(band.ageBand, 1)}
                    disabled={count >= max}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          {totalTravelers > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Total: {totalTravelers} traveler{totalTravelers !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

        {/* CTA Button - Viator Style */}
        <Button
          asChild
          size="lg"
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
