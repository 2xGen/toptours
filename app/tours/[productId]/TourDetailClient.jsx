"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Star, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Shield,
  ArrowRight,
  X,
  ArrowLeft,
  Home,
  BookOpen,
  UtensilsCrossed,
  Bookmark,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import Link from 'next/link';
import { getTourUrl, getTourProductId } from '@/utils/tourHelpers';
import { destinations } from '@/data/destinationsData';
import { viatorRefToSlug } from '@/data/viatorDestinationMap';
import { getGuidesByCountry } from '@/data/travelGuidesData';
import { toast } from '@/components/ui/use-toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import TourPromotionCard from '@/components/promotion/TourPromotionCard';

export default function TourDetailClient({ tour, similarTours = [], productId, pricing = null, enrichment = null, initialPromotionScore = null, destinationData = null, restaurantCount = 0 }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [destination, setDestination] = useState(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [isGeneratingMatch, setIsGeneratingMatch] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchModalMessage, setMatchModalMessage] = useState('');
  const [tourValuesExtracted, setTourValuesExtracted] = useState(false);
  const [showMatchResultsModal, setShowMatchResultsModal] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const getSlugFromRef = (value) => {
    if (!value) return null;
    const normalized = String(value).replace(/^d/i, '');
    return viatorRefToSlug[normalized] || null;
  };

  const primaryDestinationSlug = (() => {
    if (tour?.destinations && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      if (!entry) return null;

      if (typeof entry.id === 'string' && destinations.some((dest) => dest.id === entry.id)) {
        return entry.id;
      }

      const slugFromRef =
        getSlugFromRef(entry.destinationId) ||
        getSlugFromRef(entry.id) ||
        getSlugFromRef(entry.ref);

      if (slugFromRef) return slugFromRef;

      const candidateName = (entry.destinationName || entry.name || '').toLowerCase();
      if (candidateName) {
        const matchedByName = destinations.find((dest) => {
          const comparable = [
            dest.id,
            dest.name,
            dest.fullName,
            dest.country,
          ]
            .filter(Boolean)
            .map((value) => value.toLowerCase());
          return comparable.includes(candidateName);
        });
        if (matchedByName) return matchedByName.id;
      }
    }
    return null;
  })();

  const derivedDestinationName = useMemo(() => {
    if (destination?.fullName || destination?.name) {
      return destination.fullName || destination.name;
    }
    if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      return entry?.destinationName || entry?.name || '';
    }
    return '';
  }, [destination, tour]);

  const similarSectionTitle = derivedDestinationName
    ? `Other Tours in ${derivedDestinationName}`
    : 'Other Tours You Might Like';

  const destinationTourUrl = useMemo(() => {
    if (primaryDestinationSlug) {
      return `/destinations/${primaryDestinationSlug}/tours`;
    }
    if (Array.isArray(tour?.destinations) && tour.destinations.length > 0) {
      const entry = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      if (entry?.destinationId) {
        return `/destinations/${entry.destinationId}/tours`;
      }
      if (entry?.id) {
        return `/destinations/${entry.id}/tours`;
      }
    }
    return null;
  }, [primaryDestinationSlug, tour]);

  // Fallback: try to resolve slug by destination name if URL above is still null
  const fallbackDestinationSlugByName = useMemo(() => {
    if (!derivedDestinationName) return null;
    const match = destinations.find((d) => {
      const name = (d.fullName || d.name || '').toLowerCase();
      return name === derivedDestinationName.toLowerCase();
    });
    return match?.id || null;
  }, [derivedDestinationName]);

  const finalDestinationTourUrl = useMemo(() => {
    if (destinationTourUrl) return destinationTourUrl;
    if (fallbackDestinationSlugByName) {
      return `/destinations/${fallbackDestinationSlugByName}/tours`;
    }
    return null;
  }, [destinationTourUrl, fallbackDestinationSlugByName]);

  // Get destination name and ID for unmatched destinations (for display in breadcrumbs and sidebar)
  const unmatchedDestinationName = useMemo(() => {
    if (destination) return null; // Only for unmatched destinations
    return destinationData?.destinationName || null;
  }, [destination, destinationData]);

  // Get Viator destination slug/ID for unmatched destinations (for linking to tours page)
  // Prefer slug from destinationData if available, otherwise use ID
  const unmatchedDestinationSlug = useMemo(() => {
    if (destination) return null; // Only for unmatched destinations
    // Use slug from destinationData if available (SEO-friendly)
    if (destinationData?.slug) {
      return destinationData.slug;
    }
    // Fall back to destinationId from destinationData
    if (destinationData?.destinationId) {
      return destinationData.destinationId;
    }
    // Last resort: extract from tour data
    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDestination = tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];
      return primaryDestination?.ref || primaryDestination?.destinationId || primaryDestination?.id || null;
    }
    return null;
  }, [destination, destinationData, tour]);

  // Trigger confetti when returning from instant boost payment
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const boostSuccess = searchParams.get('boost_success') === 'true';
    if (boostSuccess) {
      // Trigger confetti celebration
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('boost_success');
      window.history.replaceState({}, '', url.toString());

      return () => clearInterval(interval);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Remove browser extension attributes that cause hydration errors
    const removeExtensionAttributes = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el.hasAttribute('bis_skin_checked')) {
          el.removeAttribute('bis_skin_checked');
        }
        if (el.hasAttribute('bis_register')) {
          el.removeAttribute('bis_register');
        }
      });
    };

    // Remove immediately and then repeatedly to catch extension injections
    removeExtensionAttributes();
    const immediateTimer = setTimeout(removeExtensionAttributes, 0);
    const delayedTimer = setTimeout(removeExtensionAttributes, 100);
    const observerTimer = setTimeout(removeExtensionAttributes, 500);
    
    // Use MutationObserver to watch for new attribute additions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target && target instanceof Element) {
            if (target.hasAttribute('bis_skin_checked') || target.hasAttribute('bis_register')) {
              target.removeAttribute('bis_skin_checked');
              target.removeAttribute('bis_register');
            }
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {
              const el = node;
              if (el.hasAttribute('bis_skin_checked')) {
                el.removeAttribute('bis_skin_checked');
              }
              if (el.hasAttribute('bis_register')) {
                el.removeAttribute('bis_register');
              }
              // Also check children
              el.querySelectorAll('*').forEach((child) => {
                child.removeAttribute('bis_skin_checked');
                child.removeAttribute('bis_register');
              });
            }
          });
        }
      });
    });

    // Observe the entire document
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['bis_skin_checked', 'bis_register'],
      childList: true,
      subtree: true,
    });
    
    // Detect scroll for sticky button
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(delayedTimer);
      clearTimeout(observerTimer);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Tour view tracking is now handled by PageViewTracker component in layout.js
  // This ensures consistent tracking across all pages and avoids duplicate tracking
  // The PageViewTracker automatically detects tour pages and updates aggregated counts

  useEffect(() => {
    if (primaryDestinationSlug) {
      const matchedBySlug = destinations.find((dest) => dest.id === primaryDestinationSlug);
      if (matchedBySlug) {
        setDestination(matchedBySlug);
        return;
      }
    }

    if (tour?.destinations && tour.destinations.length > 0) {
      const primaryDest = tour.destinations.find((d) => d.primary) || tour.destinations[0];
      const destName = (primaryDest.destinationName || primaryDest.name || '').toLowerCase();

      if (destName) {
        const matchedDest = destinations.find((dest) => {
          const destId = dest.id || dest.name?.toLowerCase().replace(/\s/g, '-');
          const destFullName = (dest.fullName || dest.name || '').toLowerCase();
          return (
            dest.id === primaryDestinationSlug ||
            destFullName === destName ||
            destFullName.includes(destName) ||
            destName.includes(destFullName) ||
            destId === destName.replace(/\s/g, '-')
          );
        });

        if (matchedDest) {
          setDestination(matchedDest);
          return;
        }
      }
    }

    if (tour?.title) {
      const titleLower = tour.title.toLowerCase();
      const matchedDest = destinations.find((dest) => {
        const destName = (dest.name || dest.fullName || '').toLowerCase();
        return destName && titleLower.includes(destName);
      });
      if (matchedDest) {
        setDestination(matchedDest);
      }
    }
  }, [tour, primaryDestinationSlug]);

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationNext />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Tour not found</p>
        </div>
        <FooterNext />
      </div>
    );
  }

  // Debug: Log the tour object structure to console
  useEffect(() => {
    if (tour) {
      console.log('Tour object structure:', tour);
      console.log('Description locations:', {
        'tour.description?.summary': tour.description?.summary,
        'tour.description?.shortDescription': tour.description?.shortDescription,
        'tour.description?.description': tour.description?.description,
        'tour.productContent?.description': tour.productContent?.description,
        'tour.description': tour.description,
      });
      console.log('Price locations:', {
        'tour.pricing?.summary?.fromPrice': tour.pricing?.summary?.fromPrice,
        'tour.pricing?.fromPrice': tour.pricing?.fromPrice,
        'tour.pricing?.amount': tour.pricing?.amount,
        'tour.pricing': tour.pricing,
        'tour.price': tour.price,
        'tour.pricingInfo': tour.pricingInfo,
        'tour.bookingInfo': tour.bookingInfo,
      });
    }
  }, [tour]);

  // Extract data from Viator API response - use higher quality image variants
  // Try variants in order: [5] (largest), [4], [3], [2], [1], [0]
  const getHighQualityImage = () => {
    if (!tour.images || !tour.images[0] || !tour.images[0].variants) return '';
    const variants = tour.images[0].variants;
    // Try to get the highest quality variant available
    return variants[5]?.url || variants[4]?.url || variants[3]?.url || variants[2]?.url || variants[1]?.url || variants[0]?.url || '';
  };
  
  const tourImage = getHighQualityImage();
  
  // Get all images for gallery and lightbox (including hero) - use useMemo for performance
  const allImages = useMemo(() => {
    if (!tour?.images || tour.images.length === 0) {
      console.log('No images found in tour:', tour);
      return [];
    }
    
    const images = tour.images.map((img, idx) => {
      if (!img.variants || !Array.isArray(img.variants)) {
        console.log(`Image ${idx} has no variants:`, img);
        return null;
      }
      // Get the best quality variant available
      const variants = img.variants;
      const url = variants[5]?.url || variants[4]?.url || variants[3]?.url || variants[2]?.url || variants[1]?.url || variants[0]?.url || '';
      if (!url) {
        console.log(`Image ${idx} has no valid URL:`, variants);
        return null;
      }
      return {
        url,
        caption: img.caption || '',
        alt: img.caption || tour.title || 'Tour image'
      };
    }).filter(Boolean);
    
    console.log(`Found ${images.length} images for tour:`, images);
    return images;
  }, [tour]);
  
  // Get additional images for gallery (exclude the first one which is used as hero)
  const additionalImages = allImages.slice(1, 7); // Show up to 6 additional images in gallery
  
  // Lightbox functions
  const openLightbox = useCallback((index) => {
    console.log('Opening lightbox at index:', index, 'Total images:', allImages.length);
    if (allImages.length === 0) {
      console.warn('Cannot open lightbox: no images available');
      return;
    }
    const validIndex = Math.max(0, Math.min(index, allImages.length - 1));
    setLightboxIndex(validIndex);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }, [allImages.length]);
  
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);
  
  const nextImage = useCallback(() => {
    if (allImages.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);
  
  const prevImage = useCallback(() => {
    if (allImages.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);
  // Extract rating and review count
  // Based on actual API: reviews.combinedAverageRating and reviews.totalReviews
  const rating = tour.reviews?.combinedAverageRating || 
                 tour.reviews?.averageRating || 
                 0;
  const reviewCount = tour.reviews?.totalReviews || 
                      tour.reviews?.totalCount || 
                      0;

  // Build rating breakdown (per-star counts) using multiple possible API shapes
  const { ratingBreakdown, ratingBreakdownTotal } = useMemo(() => {
    const candidateArrays = [];

    if (Array.isArray(tour?.reviews?.reviewCountTotals) && tour.reviews.reviewCountTotals.length > 0) {
      candidateArrays.push(tour.reviews.reviewCountTotals);
    }

    if (Array.isArray(tour?.reviews?.sources)) {
      tour.reviews.sources.forEach((source) => {
        if (Array.isArray(source?.reviewCounts) && source.reviewCounts.length > 0) {
          candidateArrays.push(source.reviewCounts);
        }
      });
    }

    candidateArrays.push(
      tour?.reviews?.ratingCounts,
      tour?.reviews?.ratingsCount,
      tour?.reviews?.breakdown,
      tour?.reviews?.distribution,
      tour?.reviews?.ratingDistribution?.buckets,
      tour?.reviews?.ratingsDistribution
    );

    const normalized = [];

    for (const arr of candidateArrays) {
      if (Array.isArray(arr) && arr.length > 0) {
        const entries = arr
          .map((item, index) => {
            const ratingValue = Number(
              item?.rating ??
              item?.stars ??
              item?.starRating ??
              item?.label ??
              (typeof item === 'number' && index + 1)
            );
            const countValue = Number(
              item?.count ??
              item?.total ??
              item?.value ??
              item?.quantity ??
              item?.number ??
              (typeof item === 'number' ? item : undefined)
            );

            if (!ratingValue || !countValue) return null;
            return { rating: ratingValue, count: countValue };
          })
          .filter(Boolean);

          if (entries.length > 0) {
            normalized.push(...entries);
            break;
          }
      }
    }

    if (!normalized.length) {
      return { ratingBreakdown: [], ratingBreakdownTotal: 0 };
    }

    let totalForPercent = reviewCount > 0
      ? reviewCount
      : normalized.reduce((sum, item) => sum + (item.count || 0), 0);

    if (!totalForPercent) {
      totalForPercent = normalized.reduce((sum, item) => sum + (item.count || 0), 0);
    }

    if (!totalForPercent) {
      return { ratingBreakdown: [], ratingBreakdownTotal: 0 };
    }

    const combined = normalized.reduce((acc, item) => {
      const existing = acc.find(entry => entry.rating === item.rating);
      if (existing) {
        existing.count += item.count;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    const processed = combined
      .filter(item => item.count > 0)
      .sort((a, b) => b.rating - a.rating)
      .map(item => ({
        rating: item.rating,
        count: item.count,
        percentage: Math.max(0, Math.round((item.count / totalForPercent) * 100))
      }));

    return { ratingBreakdown: processed, ratingBreakdownTotal: totalForPercent };
  }, [tour, reviewCount]);
  
  // Extract price from multiple possible locations
  // Viator API might return price in different formats
  const getPrice = () => {
    // First try the pricing prop passed from server (from search API)
    if (pricing && pricing > 0) {
      return pricing;
    }
    // Try pricing.summary.fromPrice first (most common)
    if (tour.pricing?.summary?.fromPrice) {
      return tour.pricing.summary.fromPrice;
    }
    // Try pricing.fromPrice
    if (tour.pricing?.fromPrice) {
      return tour.pricing.fromPrice;
    }
    // Try pricing.amount
    if (tour.pricing?.amount) {
      return tour.pricing.amount;
    }
    // Try price object
    if (tour.price?.fromPrice) {
      return tour.price.fromPrice;
    }
    if (tour.price?.amount) {
      return tour.price.amount;
    }
    if (typeof tour.price === 'number') {
      return tour.price;
    }
    // Try pricingInfo
    if (tour.pricingInfo?.fromPrice) {
      return tour.pricingInfo.fromPrice;
    }
    // Try bookingInfo
    if (tour.bookingInfo?.price) {
      return tour.bookingInfo.price;
    }
    // Try pricingMatrix (if available)
    if (tour.pricingMatrix && Array.isArray(tour.pricingMatrix) && tour.pricingMatrix.length > 0) {
      const adultPrice = tour.pricingMatrix.find(p => p.ageBand === 'ADULT')?.price;
      if (adultPrice) return adultPrice;
      return tour.pricingMatrix[0]?.price || 0;
    }
    return 0;
  };
  
  const price = getPrice();
  
  // Extract duration - check multiple possible locations
  // Based on actual API: itinerary.duration.fixedDurationInMinutes
  const duration = tour.itinerary?.duration?.fixedDurationInMinutes ||
                   tour.duration?.fixedDurationInMinutes || 
                   tour.duration?.variableDurationFromMinutes || 
                   tour.duration?.duration ||
                   null;
  const viatorUrl = tour.productUrl || 
                    tour.url || 
                    `https://www.viator.com/tours/${productId}`;
  
  // Extract highlights - could be in different formats
  // Priority: viatorUniqueContent.highlights > tour.highlights > other sources
  // Ensure it's always an array
  const getHighlights = () => {
    // First try viatorUniqueContent.highlights (better formatted)
    if (Array.isArray(tour.viatorUniqueContent?.highlights) && tour.viatorUniqueContent.highlights.length > 0) {
      // Clean up highlights - remove extra whitespace and newlines
      return tour.viatorUniqueContent.highlights
        .map(h => typeof h === 'string' ? h.trim().replace(/\n/g, ' ') : h)
        .filter(h => h && h.length > 0);
    }
    
    // Fallback to other sources
    const data = tour.highlights || 
                 tour.highlightsList || 
                 tour.productContent?.highlights ||
                 tour.productContent?.highlightsList ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      // Clean up highlights - remove extra whitespace
      return data
        .map(h => typeof h === 'string' ? h.trim().replace(/\n/g, ' ') : h)
        .filter(h => h && h.length > 0);
    }
    if (typeof data === 'string') return [data.trim()];
    if (typeof data === 'object' && data !== null) {
      // If it's an object, try to extract values
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(v => typeof v === 'string' ? v.trim() : v).filter(Boolean) : [];
    }
    return [];
  };
  
  const highlights = getHighlights();
  
  // Extract inclusions/exclusions - check multiple possible locations
  // Based on actual API: inclusions is an array of objects with description field
  // Handle "OTHER" category by using otherDescription field
  const getInclusions = () => {
    // Helper function to extract text from an inclusion/exclusion item
    const extractItemText = (item) => {
      if (!item || typeof item !== 'object') return '';
      
      // Check if object is empty
      if (Object.keys(item).length === 0) return '';
      
      // If category is "OTHER", use otherDescription
      if (item.category === 'OTHER' && item.otherDescription) {
        return item.otherDescription;
      }
      
      // Otherwise, try description, otherDescription, typeDescription, or categoryDescription
      return item.description || 
             item.otherDescription || 
             item.typeDescription || 
             item.categoryDescription || 
             '';
    };
    
    // First try direct inclusions array (actual API structure)
    if (Array.isArray(tour.inclusions)) {
      return tour.inclusions
        .map(extractItemText)
        .filter(Boolean); // Filter out empty strings and empty objects
    }
    
    // Fallback to other possible locations
    const data = tour.inclusions?.includedItems || 
                 tour.inclusions?.included || 
                 tour.inclusions?.includes ||
                 tour.productContent?.inclusions?.included || 
                 tour.productContent?.inclusions?.includedItems ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return extractItemText(item);
          }
          return '';
        })
        .filter(Boolean);
    }
    if (typeof data === 'string') return [data];
    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(extractItemText).filter(Boolean) : [];
    }
    return [];
  };
  
  const getExclusions = () => {
    // Helper function to extract text from an inclusion/exclusion item
    const extractItemText = (item) => {
      if (!item || typeof item !== 'object') return '';
      
      // Check if object is empty
      if (Object.keys(item).length === 0) return '';
      
      // If category is "OTHER", use otherDescription
      if (item.category === 'OTHER' && item.otherDescription) {
        return item.otherDescription;
      }
      
      // Otherwise, try description, otherDescription, typeDescription, or categoryDescription
      return item.description || 
             item.otherDescription || 
             item.typeDescription || 
             item.categoryDescription || 
             '';
    };
    
    // Exclusions might not be in the API response, but check anyway
    const data = tour.exclusions ||
                 tour.inclusions?.excludedItems || 
                 tour.inclusions?.excluded || 
                 tour.inclusions?.excludes ||
                 tour.productContent?.inclusions?.excluded || 
                 tour.productContent?.inclusions?.excludedItems ||
                 [];
    // If it's not an array, try to convert it
    if (Array.isArray(data)) {
      return data
        .map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return extractItemText(item);
          }
          return '';
        })
        .filter(Boolean);
    }
    if (typeof data === 'string') return [data];
    if (typeof data === 'object' && data !== null) {
      const values = Object.values(data).flat();
      return Array.isArray(values) ? values.map(extractItemText).filter(Boolean) : [];
    }
    return [];
  };
  
  const inclusions = getInclusions();
  const exclusions = getExclusions();
  
  // Extract description - check multiple possible locations
  // Priority: viatorUniqueContent.longDescription > viatorUniqueContent.shortDescription > other sources
  // Based on actual API structure: viatorUniqueContent has better formatted content
  const description = tour.viatorUniqueContent?.longDescription ||
                     tour.viatorUniqueContent?.shortDescription ||
                     tour.description || 
                     tour.description?.summary || 
                     tour.description?.shortDescription || 
                     tour.description?.description || 
                     tour.description?.longDescription ||
                     tour.description?.fullDescription ||
                     tour.productContent?.description?.summary ||
                     tour.productContent?.description?.shortDescription ||
                     tour.productContent?.description ||
                     tour.productContent?.summary ||
                     tour.summary ||
                     tour.overview ||
                     '';
  
  // Extract insider tips if available
  const insiderTips = tour.viatorUniqueContent?.insiderTips || '';
  
  const flags = tour.flags || [];
  const supplierName = tour?.supplier?.name ||
                       tour?.supplierName ||
                       tour?.operator?.name ||
                       tour?.vendor?.name ||
                       tour?.partner?.name ||
                       '';

  // Check if tour values are already extracted
  useEffect(() => {
    if (enrichment?.structured_values) {
      setTourValuesExtracted(true);
    }
  }, [enrichment]);

  const handleExtractTourValues = async () => {
    if (!productId || isGeneratingMatch) return;
    
    try {
      setIsGeneratingMatch(true);
      setMatchError('');

      // Call API to extract structured values (one-time)
      const response = await fetch(`/api/internal/tour-match/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extractOnly: true, // Just extract values, don't match yet
          tour: pricing ? {
            ...tour,
            pricing: {
              ...tour.pricing,
              summary: {
                ...tour.pricing?.summary,
                fromPrice: tour.pricing?.summary?.fromPrice || pricing?.fromPrice || pricing?.summary?.fromPrice,
                fromPriceBeforeDiscount: tour.pricing?.summary?.fromPriceBeforeDiscount || pricing?.fromPriceBeforeDiscount || pricing?.summary?.fromPriceBeforeDiscount,
              }
            }
          } : tour
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to extract tour values';
        const status = response.status;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorMessage;
          console.error('API Error Response:', { status, error: errorData });
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.error('API Error Text:', { status, error: errorText });
          } catch (textError) {
            console.error('API Error (could not parse):', { status, error: textError });
          }
        }
        throw new Error(`[${status}] ${errorMessage}`);
      }

      const data = await response.json();
      
      if (data.valuesExtracted) {
        setTourValuesExtracted(true);
        toast({
          title: 'Tour analyzed',
          description: 'Tour characteristics have been extracted successfully.',
        });
        router.refresh();
      } else {
        throw new Error('Failed to extract values');
      }
    } catch (error) {
      console.error('Error extracting tour values:', error);
      setMatchError(error.message || 'Unable to extract tour values');
      toast({
        title: 'Extraction failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingMatch(false);
    }
  };

  const handleGenerateMatch = async () => {
    if (!productId || isGeneratingMatch) return;
    
    try {
      setIsGeneratingMatch(true);
      setMatchError('');

      // Check if user is signed in
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please sign in to use AI tour matching. Create a free account to get personalized match scores based on your trip preferences.');
        setShowMatchModal(true);
        return;
      }

      // Check if user has trip preferences set (use cached version)
      let profile = null;
      try {
        const { getCachedUserProfile } = await import('@/lib/supabaseCache');
        profile = await getCachedUserProfile(user.id);
      } catch (error) {
        // Fallback to direct query
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('trip_preferences')
          .eq('id', user.id)
          .single();
        profile = data;
      }

      if (!profile || !profile.trip_preferences) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please set your trip preferences in your profile first. Go to your profile and fill in your travel style, budget, and preferences to get personalized match scores.');
        setShowMatchModal(true);
        return;
      }

      const userPreferences = profile.trip_preferences;
      if (!userPreferences || typeof userPreferences !== 'object' || Object.keys(userPreferences).length === 0) {
        setIsGeneratingMatch(false);
        setMatchModalMessage('Please set your trip preferences in your profile first. Go to your profile and fill in your travel style, budget, and preferences to get personalized match scores.');
        setShowMatchModal(true);
        return;
      }

      // Merge pricing prop into tour object if available
      const tourWithPricing = pricing ? {
        ...tour,
        pricing: {
          ...tour.pricing,
          summary: {
            ...tour.pricing?.summary,
            fromPrice: tour.pricing?.summary?.fromPrice || pricing?.fromPrice || pricing?.summary?.fromPrice,
            fromPriceBeforeDiscount: tour.pricing?.summary?.fromPriceBeforeDiscount || pricing?.fromPriceBeforeDiscount || pricing?.summary?.fromPriceBeforeDiscount,
          }
        }
      } : tour;

      // Call the match API
      const response = await fetch(`/api/internal/tour-match/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          tour: tourWithPricing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to generate match score');
      }

      const data = await response.json();
      const match = data?.match;

      if (match && match.matchScore !== undefined) {
        setMatchData(match);
        setShowMatchResultsModal(true); // Open modal with results
      } else {
        throw new Error('No match data returned');
      }
    } catch (error) {
      console.error('Error generating match:', error);
      setMatchError(error.message || 'Failed to generate match score');
      toast({
        title: 'Match analysis failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingMatch(false);
    }
  };

  // Helper function to check if a meeting point description is too vague
  const isMeetingPointVague = (description) => {
    if (!description || typeof description !== 'string') return true;
    
    const fullText = description.toLowerCase().trim();
    
    // Filter out descriptions that mention "barcode from reservation" as they're not helpful for meeting point
    // Even if they have location info, the barcode mention makes them confusing
    if (fullText.includes('barcode from reservation') || 
        (fullText.includes('barcode from') && fullText.includes('reservation'))) {
      return true;
    }
    
    // Split by "Special Instructions" if present, and only check the meeting point part
    const parts = description.split(/special instructions?:/i);
    const meetingPointText = parts[0].trim();
    
    if (!meetingPointText) return true;
    
    const text = meetingPointText.toLowerCase().trim();
    
    // Filter out very short single-word or two-word descriptions (like "Hotels", "Hotel", "Hotels Hotel")
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount <= 2 && text.length < 30) {
      // Check if it's just a generic word
      const genericWords = ['hotels', 'hotel', 'location', 'address', 'venue', 'meeting point', 'pickup point'];
      if (genericWords.some(word => text === word || text.startsWith(word + ' ') || text.endsWith(' ' + word))) {
        return true;
      }
    }
    
    // Very vague phrases to filter out
    const vaguePhrases = [
      'center of all playgrounds',
      'center of playgrounds',
      'meeting at the center',
      'we will be meeting at the center',
      'will be meeting at the center',
      'meeting point will be',
      'will be provided',
      'contact us for',
      'to be confirmed',
      'tbd',
      'tba',
      'location to be announced'
    ];
    
    // Check if description contains vague phrases
    const containsVaguePhrase = vaguePhrases.some(phrase => text.includes(phrase));
    
    // If it contains vague phrases and is short, filter it
    if (containsVaguePhrase && text.length < 100) {
      return true;
    }
    
    // Check for very short, generic descriptions
    if (text.length < 50) {
      // Check if it has specific location indicators
      const hasSpecificInfo = /(address|street|avenue|road|boulevard|way|drive|lane|place|gps|coordinates|landmark|restaurant|hotel|marina|park|plaza|square|station|airport|port|dock|pier|beach|#\d+|\d+\s+\w+\s+(street|avenue|road|boulevard|way|drive)|varadero|bucutiweg)/i.test(meetingPointText);
      
      // If it's short and doesn't have specific info, filter it
      // But allow if it's just "hotel" if it's part of a longer address
      if (!hasSpecificInfo && wordCount <= 3) {
        return true;
      }
    }
    
    // Check for descriptions that are too generic and short
    const genericPatterns = [
      /^we will be meeting$/i,
      /^meeting point$/i,
      /^location will be$/i,
      /^address will be$/i,
      /^hotels?$/i,
      /^hotel$/i
    ];
    
    if (genericPatterns.some(pattern => pattern.test(text) && text.length < 60)) {
      return true;
    }
    
    // Filter out descriptions that are unclear or confusing even if they have some location info
    // If it mentions barcode, GPS confusion, or unclear directions, filter it
    if (text.includes('barcode') || 
        (text.includes('gps') && text.includes('easier to locate') && text.length < 150) ||
        (text.includes('same property') && !text.includes('restaurant') && !text.includes('hotel'))) {
      // Only filter if it doesn't have very clear, specific location info
      const hasVerySpecificInfo = /(^\d+\s+\w+|#[0-9]+|street|avenue|road|boulevard)/i.test(meetingPointText);
      if (!hasVerySpecificInfo || text.length < 80) {
        return true;
      }
    }
    
    return false;
  };

  // Helper function to check if special instructions are just cancellation policy
  const isSpecialInstructionsCancellationOnly = (instructions) => {
    if (!instructions || typeof instructions !== 'string') return false;
    
    const text = instructions.toLowerCase().trim();
    
    // Check if it's just cancellation policy text
    const cancellationPatterns = [
      /^cancel\s+(at\s+least|at\s+minimum)/i,
      /^cancellation\s+(policy|required|minimum)/i,
      /^cancel\s+\d+\s+hours?/i,
      /^cancel\s+\d+\s+days?/i,
      /^(full|partial)\s+refund/i
    ];
    
    return cancellationPatterns.some(pattern => pattern.test(text));
  };

  // Filter meeting points to remove vague ones
  const getValidMeetingPoints = () => {
    if (!tour.logistics?.start || !Array.isArray(tour.logistics.start)) return [];
    
    return tour.logistics.start.filter(start => {
      if (!start.description) return false;
      return !isMeetingPointVague(start.description);
    });
  };

  const validMeetingPoints = getValidMeetingPoints();

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const { user: bookmarksUser, isBookmarked, toggle } = useBookmarks();

  return (
    <div className="min-h-screen pt-16" style={{ overflowX: 'hidden' }} suppressHydrationWarning>
      <NavigationNext />
      
      {/* Hero Section - Matching Destination Page Style */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden ocean-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-200 mr-2" />
                <span className="text-white font-medium">{destination?.category || 'Tour'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 md:mb-6 text-white">
                {tour.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-white/80">({reviewCount.toLocaleString('en-US')} reviews)</span>
                  </div>
                )}
                
                {duration && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(duration)}</span>
                  </div>
                )}
                
                {price > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xl font-bold text-white">
                    From ${price.toLocaleString('en-US')}
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    const res = await toggle(productId);
                    if (res?.error === 'not_signed_in') {
                      toast({
                        title: 'Sign in required',
                        description: 'Create a free account to save tours to your favorites.',
                      });
                      return;
                    }
                    toast({
                      title: isBookmarked?.(productId) ? 'Removed from favorites' : 'Saved to favorites',
                      description: 'You can view your favorites in your profile.',
                    });
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors ${
                    isBookmarked?.(productId)
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked?.(productId) ? 'text-yellow-600' : 'text-white'}`} />
                  <span>{isBookmarked?.(productId) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {flags.map((flag, index) => {
                    return (
                      <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30 text-sm">
                        {flag.replace(/_/g, ' ')}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                >
                  <a
                    href={viatorUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                  >
                    View Reviews & Availability
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Opens Viator, our trusted affiliate partner
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {tourImage && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Hero image clicked, opening lightbox at index 0, Total images:', allImages.length);
                  openLightbox(0);
                }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={tourImage}
                    alt={tour.title}
                    className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/50 transition-colors"></div>
                  {allImages.length > 1 && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      {allImages.length} photos
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/destinations" className="text-gray-500 hover:text-gray-700">Destinations</Link>
            {destination && (
              <>
                <span className="text-gray-400">/</span>
                <Link href={`/destinations/${destination.id}`} className="text-gray-500 hover:text-gray-700">
                  {destination.fullName || destination.name}
                </Link>
                <span className="text-gray-400">/</span>
                <Link href={`/destinations/${destination.id}/tours`} className="text-gray-500 hover:text-gray-700">Tours</Link>
              </>
            )}
            {!destination && unmatchedDestinationName && (
              <>
                <span className="text-gray-400">/</span>
                {unmatchedDestinationSlug ? (
                  <>
                    <Link href={`/destinations/${unmatchedDestinationSlug}/tours`} className="text-gray-500 hover:text-gray-700">
                      {unmatchedDestinationName}
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">Tours</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">{unmatchedDestinationName}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">Tours</span>
                  </>
                )}
              </>
            )}
            {!destination && !unmatchedDestinationName && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">Tours</span>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium line-clamp-1">{tour.title}</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 bg-white" style={{ overflowX: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Main Content Column - 2/3 width */}
            <article className="flex-1 lg:flex-[2] space-y-8 w-full min-w-0">
              {/* Description */}
              {description ? (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h2>
                  <div className="prose max-w-none text-gray-700 leading-relaxed">
                    <p className="text-lg">{description}</p>
                  </div>
                </motion.section>
              ) : null}

              {/* Image Gallery */}
              {additionalImages.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                  <div className={`grid gap-4 ${
                    additionalImages.length === 1 ? 'grid-cols-1' :
                    additionalImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    additionalImages.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {additionalImages.map((img, index) => {
                      // Calculate the correct index in allImages (hero is index 0, so gallery starts at 1)
                      const imageIndexInAll = index + 1;
                      
                      return (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden aspect-video bg-gray-200 group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Gallery image clicked:', imageIndexInAll, 'Total images:', allImages.length);
                            openLightbox(imageIndexInAll);
                          }}
                        >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm line-clamp-2">{img.caption}</p>
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {!description && (
                // Debug: Show raw JSON structure if description is missing
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug: Tour Data Structure</h2>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold text-gray-700 mb-2">Click to view raw JSON structure</summary>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                      {JSON.stringify(tour, null, 2)}
                    </pre>
                  </details>
                </motion.section>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight, index) => {
                      // Handle both string and object formats
                      const highlightText = typeof highlight === 'string' ? highlight.trim() : highlight.text || highlight.name || '';
                      if (!highlightText || highlightText.length === 0) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">{highlightText}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Insider Tips */}
              {insiderTips && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-blue-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>💡</span>
                    Insider Tips
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{insiderTips}</p>
                </motion.section>
              )}

              {/* Tour Characteristics (Extracted Values) */}
              {enrichment?.structured_values && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-purple-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-purple-600 text-xl font-bold">
                      📊
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-purple-500">Tour Analysis</p>
                      <h2 className="text-2xl font-bold text-gray-900">Tour Characteristics</h2>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Powered by Gemini AI
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-base mb-6">
                    This tour has been analyzed using Gemini AI to help you understand its key features and match it with your travel preferences.
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: 'adventureLevel', label: '🔥 Adventure Level', icon: '🔥' },
                      { key: 'structureLevel', label: '📋 Structure Level', icon: '📋' },
                      { key: 'foodImportance', label: '🍷 Food & Drink Importance', icon: '🍷' },
                      { key: 'groupType', label: '👥 Group Type', icon: '👥' },
                      { key: 'budgetLevel', label: '💰 Budget Level', icon: '💰' },
                      { key: 'relaxationVsExploration', label: '🌊 Relaxation vs Exploration', icon: '🌊' },
                    ].map(({ key, label, icon }) => {
                      const value = enrichment.structured_values[key];
                      if (value === undefined || value === null) return null;
                      
                      // Convert numeric value to descriptive text
                      const getValueLabel = (val) => {
                        if (val <= 25) return 'Low';
                        if (val <= 50) return 'Moderate';
                        if (val <= 75) return 'High';
                        return 'Very High';
                      };
                      
                      const getValueColor = (val) => {
                        if (val <= 25) return 'bg-blue-500';
                        if (val <= 50) return 'bg-yellow-500';
                        if (val <= 75) return 'bg-orange-500';
                        return 'bg-red-500';
                      };
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <span className="text-sm font-medium text-gray-700">{label.replace(/^[^\s]+\s/, '')}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${getValueColor(value)}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-right">
                                {value}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-xs text-gray-500 text-center">
                        Set your travel preferences in your profile to see how well this tour matches your style.
                      </p>
                      <Button
                        onClick={handleGenerateMatch}
                        disabled={isGeneratingMatch}
                        className="sunset-gradient text-white font-semibold px-6 py-3"
                      >
                        {isGeneratingMatch ? (
                          <span className="flex items-center gap-2">
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                            </span>
                            Calculating match…
                          </span>
                        ) : (
                          'See Match with My Preferences'
                        )}
                      </Button>
                      {matchError && <p className="text-sm text-red-600">{matchError}</p>}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Show button to analyze if values not extracted yet */}
              {!enrichment?.structured_values && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm p-6 md:p-8 border border-dashed border-purple-200 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-purple-600 text-xl font-bold">
                      📊
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-purple-500">Tour Analysis</p>
                      <h2 className="text-2xl font-bold text-gray-900">Tour Characteristics</h2>
                    </div>
                    <p className="text-gray-600 text-base max-w-3xl">
                      Analyze this tour to extract its characteristics (adventure level, structure, food importance, etc.). This is a one-time analysis that enables personalized matching.
                    </p>
                    <Button
                      onClick={handleExtractTourValues}
                      disabled={isGeneratingMatch}
                      className="sunset-gradient text-white font-semibold px-6 py-3"
                    >
                      {isGeneratingMatch ? (
                        <span className="flex items-center gap-2">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-white" />
                          </span>
                          Analyzing tour…
                        </span>
                      ) : (
                        'Analyze Tour Characteristics'
                      )}
                    </Button>
                    {matchError && <p className="text-sm text-red-600">{matchError}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      One-time analysis • Enables preference matching
                    </p>
                  </div>
                </motion.section>
              )}


              {/* What's Included */}
              {inclusions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                  <div className="space-y-3">
                    {inclusions.map((item, index) => {
                      // Handle both string and object formats
                      const itemText = typeof item === 'string' ? item : item.text || item.name || '';
                      if (!itemText) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{itemText}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* What's Not Included */}
              {exclusions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Not Included</h2>
                  <div className="space-y-3">
                    {exclusions.map((item, index) => {
                      // Handle both string and object formats
                      const itemText = typeof item === 'string' ? item : item.text || item.name || '';
                      if (!itemText) return null;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{itemText}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Additional Information */}
              {tour.additionalInfo && Array.isArray(tour.additionalInfo) && tour.additionalInfo.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
                  <div className="space-y-3">
                    {tour.additionalInfo.map((info, index) => {
                      if (!info.description) return null;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{info.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Logistics / Meeting Point */}
              {validMeetingPoints.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Point</h2>
                  <div className="space-y-4">
                    {validMeetingPoints.map((start, index) => {
                      if (!start.description) return null;
                      return (
                        <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                          <p className="text-gray-700 whitespace-pre-line">{start.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  {tour.logistics?.redemption?.specialInstructions && 
                   !isMeetingPointVague(tour.logistics.redemption.specialInstructions) &&
                   !isSpecialInstructionsCancellationOnly(tour.logistics.redemption.specialInstructions) && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
                      <p className="text-gray-700 whitespace-pre-line">{tour.logistics.redemption.specialInstructions}</p>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Cancellation Policy */}
              {tour.cancellationPolicy && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700">{tour.cancellationPolicy.description}</p>
                    {tour.cancellationPolicy.cancelIfBadWeather && (
                      <p className="text-sm text-gray-600 mt-2">✓ Free cancellation due to bad weather</p>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Supplier */}
              {supplierName && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-purple-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-purple-500 mb-2">Tour Operator</p>
                      <h2 className="text-2xl font-bold text-gray-900">{supplierName}</h2>
                      <p className="text-gray-600 mt-2">
                        Official supplier for this experience. Bookings are handled directly through Viator with verified partners.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 text-purple-700">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <div className="text-sm">
                        <p className="font-semibold">Viator Certified</p>
                        <p className="text-xs text-purple-600/80">Trusted local operator</p>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Rating Breakdown */}
              {ratingBreakdown.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white rounded-lg shadow-sm p-6 md:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Guest Ratings</h2>
                      <p className="text-sm text-gray-600">
                        Based on {(ratingBreakdownTotal || reviewCount).toLocaleString('en-US')} verified reviews
                      </p>
                    </div>
                    {rating > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-700">
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                          {rating.toFixed(1)}
                        </div>
                        <p className="text-xs text-purple-700/80 mt-1">Average rating</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {ratingBreakdown.map((item) => (
                      <div key={`rating-${item.rating}`} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {item.rating}★
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm text-gray-600">
                          {item.count.toLocaleString('en-US')} • {item.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>

                </motion.section>
              )}

          {/* (moved) View all tours button now sits under the similar tours grid */}

              {/* Book CTA after Ratings */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: ratingBreakdown.length > 0 ? 0.85 : 0.7 }}
                className="bg-gradient-to-br from-purple-600/90 to-pink-500/90 rounded-2xl shadow-lg p-6 sm:p-8 text-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <p className="uppercase text-xs tracking-[0.3em] text-white/80 mb-2">Ready to Go?</p>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Book {tour.title || 'this tour'}
                    </h3>
                    <p className="text-white/90 text-base leading-relaxed">
                      Secure your spot instantly through Viator and receive flexible cancellation options plus verified customer support.
                    </p>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-md shadow-purple-900/30"
                    >
                      <a
                        href={viatorUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                      >
                        View Reviews & Availability
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </a>
                    </Button>
                    <div className="absolute top-2 right-2 group">
                      <Info className="w-3.5 h-3.5 text-purple-700/70 cursor-help bg-white/80 rounded-full p-0.5" />
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        Opens Viator, our trusted affiliate partner
                        <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 mt-2 text-center">
                      Trusted partner • Instant confirmation
                    </p>
                  </div>
                </div>
              </motion.section>
            </article>

            {/* Sidebar - 1/3 width, sticky */}
            <aside className="w-full lg:w-auto lg:flex-1 lg:max-w-sm lg:min-w-[320px] lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-6">
                {/* Booking Card */}
                <Card className="bg-white border-2 border-purple-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      {price > 0 && (
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          From ${price.toLocaleString('en-US')}
                        </div>
                      )}
                      {duration && (
                        <div className="text-gray-600 flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(duration)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Button
                        asChild
                        size="lg"
                        className="w-full sunset-gradient text-white hover:scale-105 transition-transform duration-200 font-semibold py-6"
                      >
                        <a
                          href={viatorUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                        >
                          View Reviews & Availability
                          <ExternalLink className="w-5 h-5 ml-2" />
                        </a>
                      </Button>
                      <div className="absolute top-2 right-2 group">
                        <Info className="w-3.5 h-3.5 text-white/70 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          Opens Viator, our trusted affiliate partner
                          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                      Opens Viator, our trusted affiliate partner
                      <ExternalLink className="w-3 h-3" />
                    </p>

                    {flags.includes('FREE_CANCELLATION') && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                        <Shield className="w-4 h-4" />
                        <span>Free cancellation available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Promotion Card */}
                <TourPromotionCard 
                  productId={productId} 
                  tourData={tour}
                  destinationId={primaryDestinationSlug || null}
                  initialScore={initialPromotionScore}
                />

                {/* Destination Link */}
                {destination && (
                  <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        alt={destination.fullName || destination.name}
                        src={destination.imageUrl}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1595872018818-97555653a011";
                        }}
                      />
                      {destination.category && (
                        <Badge className="absolute top-4 left-4 adventure-gradient text-white">
                          {destination.category}
                        </Badge>
                      )}
                      {destination.country && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-sm font-medium text-gray-800">{destination.country}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 flex flex-col">
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{destination.fullName || destination.name}</span>
                      </div>
                      <p className="text-gray-700 mb-4 flex-grow">
                        {destination.briefDescription || `Discover more tours and activities in ${destination.fullName || destination.name}`}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                      >
                        <Link href={`/destinations/${destination.id}`}>
                          Explore {destination.name}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Generic Explore All Destinations Card (for unmatched destinations) */}
                {!destination && (
                  <Card className="bg-white border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Explore destinations"
                        src="https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/toptours%20destinations.png"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                        }}
                      />
                    </div>
                    <CardContent className="p-6 flex flex-col">
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="font-semibold">
                          {unmatchedDestinationName || 'Explore Destinations'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 flex-grow">
                        {unmatchedDestinationName 
                          ? `Discover more tours and activities in ${unmatchedDestinationName}`
                          : 'Discover incredible tours and activities in 180+ destinations around the world'}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent transition-all duration-200 h-12 text-base font-semibold"
                      >
                        <Link href={unmatchedDestinationSlug ? `/destinations/${unmatchedDestinationSlug}/tours` : "/destinations"}>
                          {unmatchedDestinationName 
                            ? `View Top Tours in ${unmatchedDestinationName}`
                            : 'Explore All Destinations'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          </div>

          {/* Similar Tours Section */}
          {similarTours.length > 0 && (
            <motion.section
              id="similar-tours"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{similarSectionTitle}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarTours.map((similarTour, index) => {
                  const similarTourId = getTourProductId(similarTour);
                  const similarTourUrl = getTourUrl(similarTourId, similarTour.title);
                  const similarImage = similarTour.images?.[0]?.variants?.[5]?.url || 
                                      similarTour.images?.[0]?.variants?.[4]?.url || 
                                      similarTour.images?.[0]?.variants?.[3]?.url || 
                                      similarTour.images?.[0]?.variants?.[0]?.url || '';
                  const similarRating = similarTour.reviews?.combinedAverageRating || 0;
                  const similarReviewCount = similarTour.reviews?.totalReviews || 0;
                  const similarPrice = similarTour.pricing?.summary?.fromPrice || 0;

                  return (
                    <Card key={similarTourId || index} className="bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <div 
                        className="relative h-48 bg-gray-200 flex-shrink-0 cursor-pointer" 
                        onClick={() => router.push(similarTourUrl)}
                      >
                        {similarImage ? (
                          <img
                            src={similarImage}
                            alt={similarTour.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 
                          className="font-semibold text-gray-800 mb-2 line-clamp-2 flex-1 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => router.push(similarTourUrl)}
                        >
                          {similarTour.title}
                        </h3>
                        
                        {similarRating > 0 && (
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-700 ml-1 text-sm">
                              {similarRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({similarReviewCount.toLocaleString('en-US')})
                            </span>
                          </div>
                        )}

                        <div className="text-lg font-bold text-orange-600 mb-3">
                          From ${similarPrice}
                        </div>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full mt-auto border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link href={similarTourUrl}>
                            View Details
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {finalDestinationTourUrl && (
                <div className="mt-10 text-center">
                  <Button
                    asChild
                    variant="outline"
                    className="px-6 py-3 border rounded-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Link href={finalDestinationTourUrl}>
                      View all tours in {derivedDestinationName || 'this destination'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}

            </motion.section>
          )}
        </div>
      </section>

      {/* Internal Linking Section */}
      {destination && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Get guides and restaurants for this destination */}
              {(() => {
                const destinationGuides = destination.country ? getGuidesByCountry(destination.country) : [];
                // Check if restaurants exist for this destination
                const hasRestaurants = restaurantCount > 0;
                const hasGuides = destinationGuides && destinationGuides.length > 0;

                return (
                  <>
                    {/* Destination Page Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <Link href={`/destinations/${destination.id}`}>
                        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Home className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {destination.fullName || destination.name} Destination Guide
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Explore the complete destination guide with travel tips, best time to visit, and more.
                                </p>
                                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                  View Destination Guide
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Tours Page Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <Link href={`/destinations/${destination.id}/tours`}>
                        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  All Tours & Activities in {destination.fullName || destination.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Browse all available tours and activities with filters and search.
                                </p>
                                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                  View All Tours
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>

                    {/* Top Restaurants */}
                    {hasRestaurants && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <Link href={`/destinations/${destination.id}/restaurants`}>
                          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UtensilsCrossed className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Explore Top Restaurants in {destination.fullName || destination.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Discover the best dining experiences and hand-picked restaurants.
                                  </p>
                                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                    View Restaurants
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    )}

                    {/* Popular Category Guides */}
                    {destination.tourCategories && destination.tourCategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  Popular Category Guides for {destination.fullName || destination.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Explore detailed guides for popular tour categories.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                  {destination.tourCategories.slice(0, 6).map((category) => {
                                    const categoryName = typeof category === 'object' ? category.name : category;
                                    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
                                    const hasGuide = typeof category === 'object' ? category.hasGuide : false;
                                    
                                    if (!hasGuide) return null;
                                    
                                    return (
                                      <Link 
                                        key={categorySlug}
                                        href={`/destinations/${destination.id}/guides/${categorySlug}`}
                                      >
                                        <Badge 
                                          variant="secondary" 
                                          className="w-full justify-center bg-white hover:bg-green-100 cursor-pointer border-green-200"
                                        >
                                          {categoryName}
                                        </Badge>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Travel Guides */}
                    {hasGuides && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {destination.fullName || destination.name} Travel Guides
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                  Read comprehensive guides to plan your perfect trip.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {destinationGuides.slice(0, 3).map((guide) => (
                                    <Link key={guide.id} href={`/travel-guides/${guide.id}`}>
                                      <Badge variant="secondary" className="bg-white hover:bg-blue-100 cursor-pointer">
                                        {guide.title}
                                      </Badge>
                                    </Link>
                                  ))}
                                  {destinationGuides.length > 3 && (
                                    <Badge variant="secondary" className="bg-white">
                                      +{destinationGuides.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative">
            <Button
              asChild
              size="lg"
              className="sunset-gradient text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-4 py-4 md:px-6 md:py-6 rounded-full font-semibold text-sm md:text-base"
            >
              <a
                href={viatorUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
              >
                <span>View Reviews & Availability</span>
                <ExternalLink className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <div className="absolute -top-0.5 -right-0.5 group">
              <Info className="w-3 h-3 text-gray-600 cursor-help bg-white/90 rounded-full p-0.5 shadow-sm" />
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Opens Viator, our trusted affiliate partner
                <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top Bar - Close Button, Book Button, and Image Counter */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            {/* Image Counter - Left side */}
            {allImages.length > 1 && (
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                <p className="text-white text-sm font-medium">
                  {lightboxIndex + 1} / {allImages.length}
                </p>
              </div>
            )}
            
            {/* View Reviews & Availability Button - Centered */}
            <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 -translate-x-1/2">
              <div className="relative">
                <Button
                  asChild
                  size="lg"
                  className="sunset-gradient text-white hover:scale-105 transition-transform duration-200 shadow-2xl px-6 py-3 text-base font-semibold"
                >
                  <a
                    href={viatorUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Reviews & Availability
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <div className="absolute -top-1 -right-1 group">
                  <Info className="w-3.5 h-3.5 text-white/70 cursor-help bg-orange-500 rounded-full p-0.5" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Opens Viator, our trusted affiliate partner
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button - Right side */}
            <button
              onClick={closeLightbox}
              className="text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70 ml-auto"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Previous image"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Next image"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Image Container with Caption Below */}
          <div 
            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center p-4 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-full w-full flex flex-col items-center justify-center flex-1 overflow-auto">
              {/* Image */}
              <div className="flex-shrink-0 mb-4">
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={allImages[lightboxIndex]?.url}
                  alt={allImages[lightboxIndex]?.alt || tour.title}
                  className="max-w-full max-h-[calc(100vh-20rem)] object-contain rounded-lg"
                />
              </div>
              
              {/* Image Caption - Below the image */}
              {allImages[lightboxIndex]?.caption && (
                <div className="w-full max-w-4xl bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 mb-4 flex-shrink-0">
                  <p className="text-white text-center text-sm md:text-base">{allImages[lightboxIndex].caption}</p>
                </div>
              )}
              
            </div>
          </div>
          
          {/* Thumbnail Navigation */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4 z-10">
              <div className="flex gap-2 justify-center overflow-x-auto pb-2 hide-scrollbar">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === lightboxIndex 
                        ? 'border-white scale-110' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Match Results Modal */}
      {showMatchResultsModal && matchData && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowMatchResultsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-orange-500">Preference Match</p>
                  <h2 className="text-2xl font-bold text-gray-900">How Well Does This Tour Match Your Preferences?</h2>
                </div>
              </div>
              <button
                onClick={() => setShowMatchResultsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Match Score Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg ${
                  matchData.matchScore >= 75 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                  matchData.matchScore >= 55 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  'bg-gradient-to-br from-red-400 to-red-600 text-white'
                }`}>
                  {matchData.matchScore}%
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow text-xs font-semibold text-gray-700">
                  Match
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-gray-700 text-lg leading-relaxed mb-4 text-center font-medium">
              {matchData.fitSummary}
            </p>

            {/* Ideal For */}
            {matchData.idealFor && (
              <div className="text-center mb-6">
                <span className="inline-block bg-orange-50 px-4 py-2 rounded-full text-sm font-semibold text-orange-700 border border-orange-200">
                  Ideal for: {matchData.idealFor}
                </span>
              </div>
            )}

            {/* Match Breakdown */}
            {matchData.matches && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Match Breakdown:</h3>
                <div className="space-y-3">
                  {[
                    { key: 'adventure', label: '🔥 Adventure level', icon: '🔥' },
                    { key: 'structure', label: '📋 Structure preference', icon: '📋' },
                    { key: 'food', label: '🍷 Food & drink interest', icon: '🍷' },
                    { key: 'group', label: '👥 Group size preference', icon: '👥' },
                    { key: 'budget', label: '💰 Budget vs comfort', icon: '💰' },
                    { key: 'relaxExplore', label: '🌊 Relaxation vs exploration', icon: '🌊' },
                  ].map(({ key, label, icon }) => {
                    const score = matchData.matches[key] || 0;
                    const isGood = score >= 75;
                    const isOk = score >= 50;
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="text-sm font-medium text-gray-700">{label.replace(/^[^\s]+\s/, '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isGood ? 'bg-green-500' : isOk ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                            isGood ? 'text-green-600' : isOk ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pros */}
            {matchData.pros && matchData.pros.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">✓ What makes this a good fit:</h3>
                <div className="space-y-2">
                  {matchData.pros.map((pro, index) => (
                    <div key={`pro-${index}`} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cons */}
            {matchData.cons && matchData.cons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">⚠️ Things to consider:</h3>
                <div className="space-y-2">
                  {matchData.cons.map((con, index) => (
                    <div key={`con-${index}`} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-500 mt-1">⚠</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button
                asChild
                className="sunset-gradient text-white font-semibold px-6 py-3 flex-1"
              >
                <a
                  href={viatorUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                >
                  Book this tour
                  <ExternalLink className="w-5 h-5 ml-2 inline" />
                </a>
              </Button>
              <Button
                onClick={async () => {
                  await toggle(productId);
                  toast({
                    title: isBookmarked?.(productId) ? 'Removed from favorites' : 'Saved to favorites',
                    description: isBookmarked?.(productId) ? 'This tour has been removed from your saved tours.' : 'This tour has been saved to your favorites.',
                  });
                }}
                variant="outline"
                className="flex-1 border-2 border-orange-200 hover:bg-orange-50"
              >
                <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked?.(productId) ? 'text-yellow-600 fill-yellow-600' : 'text-gray-600'}`} />
                {isBookmarked?.(productId) ? 'Saved to Favorites' : 'Save to Favorites'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Match Requirements Modal */}
      {showMatchModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowMatchModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Setup Required</h3>
                <p className="text-sm text-gray-600">To use AI tour matching</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              {matchModalMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {matchModalMessage.includes('sign in') ? (
                <Button
                  onClick={() => router.push('/auth')}
                  className="sunset-gradient text-white flex-1"
                >
                  Sign In / Sign Up
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/profile?tab=trip')}
                  className="sunset-gradient text-white flex-1"
                >
                  Go to Preferences
                </Button>
              )}
              <Button
                onClick={() => setShowMatchModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <FooterNext />
    </div>
  );
}
