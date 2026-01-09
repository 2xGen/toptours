'use client';

import { Star, ExternalLink, MessageSquare } from 'lucide-react';
import { formatReviewSnippet, formatReviewDate, getViatorBookingUrl } from '@/lib/viatorReviews';

/**
 * Review Snippets Component - TripAdvisor Inspired Design
 * 
 * Displays 3-5 review snippets from Viator/Tripadvisor
 * COMPLIANCE:
 * - Reviews are NON-INDEXED (meta tag + data attribute)
 * - Provider is displayed (Viator/Tripadvisor badge)
 * - 50 character snippets
 * - "Read Full Review" CTA links to Viator
 * - Subtle disclaimer about reviews
 */
export default function ReviewSnippets({ reviews, tour, productId, viatorBookingUrl }) {
  if (!reviews || !reviews.reviews || reviews.reviews.length === 0) {
    return null;
  }

  // Get 3-5 reviews for snippets
  const reviewSnippets = reviews.reviews.slice(0, 5);

  // Generate stars component (TripAdvisor style - larger, more prominent)
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? 'text-[#00AA6C] fill-[#00AA6C]' // TripAdvisor green
                : 'text-gray-300 fill-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get user initials for avatar
  const getUserInitials = (userName) => {
    if (!userName) return 'A';
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  // Format review date (TripAdvisor style)
  // Show relative dates for recent reviews (up to 1 month), actual dates for older ones
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Today
      if (diffDays === 0) return 'Today';
      
      // Yesterday
      if (diffDays === 1) return 'Yesterday';
      
      // Days ago (up to 1 week)
      if (diffDays < 7) return `${diffDays} days ago`;
      
      // Weeks ago (1-4 weeks)
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      
      // 1 month ago
      if (diffDays < 60) {
        return '1 month ago';
      }
      
      // Actual date for older reviews
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      {/* Non-indexing meta tag for reviews section */}
      <meta name="robots" content="noindex, nofollow" data-review-section="true" />
      
      <section
        className="review-snippets-section"
        data-noindex="true"
        data-robots="noindex, nofollow"
        data-viator-content="review-snippets"
      >
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-6 h-6 text-[#00AA6C]" />
              <h2 className="text-2xl font-bold text-gray-900">Guest Reviews Preview</h2>
            </div>
            <p className="text-gray-600 text-sm">
              See what other travelers are saying about this experience
            </p>
          </div>

          {/* Review Cards - TripAdvisor Style */}
          <div className="space-y-6 mb-8">
            {reviewSnippets.map((review, index) => {
              const snippet = formatReviewSnippet(review.text || review.title || '', 50);
              const reviewUrl = getViatorBookingUrl(tour, review.reviewReference);
              const userInitials = getUserInitials(review.userName);
              const isTripadvisor = review.provider === 'TRIPADVISOR';
              
              return (
                <div
                  key={review.reviewReference || index}
                  className="bg-gray-50 rounded-lg p-5 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isTripadvisor 
                          ? 'bg-[#00AA6C] text-white' 
                          : 'bg-purple-600 text-white'
                      }`}>
                        {userInitials}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      {/* User Name, Rating, Date */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base">
                              {review.userName || 'Anonymous'}
                            </h3>
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(review.publishedDate)}
                          </p>
                        </div>
                        {/* Provider Badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            isTripadvisor
                              ? 'bg-[#00AA6C]/10 text-[#00AA6C] border border-[#00AA6C]/20'
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isTripadvisor ? 'Tripadvisor' : 'Viator'}
                        </span>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mb-2 text-base leading-snug">
                          {review.title}
                        </h4>
                      )}

                      {/* Review Snippet */}
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        {snippet}
                        <span className="text-gray-500">...</span>
                      </p>

                      {/* Read Full Review Button */}
                      <a
                        href={reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#00AA6C] text-[#00AA6C] rounded-lg hover:bg-[#00AA6C] hover:text-white transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md group"
                      >
                        <span>Read full review</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance Disclaimer */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              <span className="font-medium">Note:</span> If you click on "read full review" you will be directed to Viator's tour page.
            </p>
          </div>

          {/* Main CTA Button */}
          <div className="text-center">
            <a
              href={viatorBookingUrl || getViatorBookingUrl(tour)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00AA6C] text-white font-semibold rounded-lg hover:bg-[#008855] transition-colors shadow-md hover:shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
              View All Reviews & Availability
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
