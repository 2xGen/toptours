"use client";

import React, { useState } from 'react';
import { Gift, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NavigationNext from '@/components/NavigationNext';

export default function PartnerInvitesAdminPage() {
  const [type, setType] = useState('tour_operator');
  const [durationMonths, setDurationMonths] = useState(3);
  const [maxTours, setMaxTours] = useState(15);
  const [restaurantUrl, setRestaurantUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCode(null);
    setCopied(false);

    try {
      const body = {
        type,
        duration_months: durationMonths,
        max_tours: type === 'tour_operator' ? maxTours : undefined,
        restaurant_url: type === 'restaurant' ? restaurantUrl : undefined,
        expires_at: expiresAt || undefined,
        notes: notes || undefined,
      };

      const response = await fetch('/api/internal/partner-invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
      } else {
        alert(data.error || 'Failed to generate code');
      }
    } catch (error) {
      alert('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavigationNext />
      
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gift className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Generate Partner Invite Code</h1>
          </div>
          <p className="text-xl text-gray-600">
            Create invite codes for tour operators and restaurants
          </p>
        </div>

        <Card className="shadow-xl border-2 border-purple-200">
          <CardContent className="p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="tour_operator">Tour Operator</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Months) *
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                </select>
              </div>

              {/* Max Tours (Tour Operators only) */}
              {type === 'tour_operator' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Tours *
                  </label>
                  <select
                    value={maxTours}
                    onChange={(e) => setMaxTours(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value={5}>5 Tours</option>
                    <option value={15}>15 Tours</option>
                  </select>
                </div>
              )}

              {/* Restaurant URL (Restaurants only) */}
              {type === 'restaurant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant URL *
                  </label>
                  <Input
                    type="text"
                    value={restaurantUrl}
                    onChange={(e) => setRestaurantUrl(e.target.value)}
                    placeholder="/destinations/aruba/restaurants/barefoot-beach-bar"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full TopTours.ai restaurant URL
                  </p>
                </div>
              )}

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., For ABC Tours - Partnership deal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Generated Code Display */}
              {generatedCode && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Code Generated!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-lg font-mono font-bold text-gray-900">
                      {generatedCode}
                    </code>
                    <Button
                      type="button"
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Share this code with your partner. They can redeem it at{' '}
                    <a href="/partners/invite" className="text-purple-600 hover:underline">
                      /partners/invite
                    </a>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Generate Invite Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

