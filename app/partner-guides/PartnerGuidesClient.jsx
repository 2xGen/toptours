"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  MapPin,
  Filter,
  X,
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import NavigationNext from '@/components/NavigationNext';
import FooterNext from '@/components/FooterNext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function PartnerGuidesClient({ regions, countries, destinations }) {
  const supabase = createSupabaseBrowserClient();
  const [partnerGuides, setPartnerGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submission form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    destination: '',
    type: 'website',
    email: ''
  });

  // Fetch partner guides
  useEffect(() => {
    fetchPartnerGuides();
  }, []);

  const fetchPartnerGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_guides')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartnerGuides(data || []);
    } catch (error) {
      console.error('Error fetching partner guides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load partner guides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract unique filter options from actual guides data
  const availableFilters = useMemo(() => {
    const uniqueRegions = [...new Set(partnerGuides.map(g => g.region).filter(Boolean))].sort();
    const uniqueCountries = [...new Set(partnerGuides.map(g => g.country).filter(Boolean))].sort();
    const uniqueTypes = [...new Set(partnerGuides.map(g => g.guide_type).filter(Boolean))];
    
    return {
      regions: uniqueRegions,
      countries: uniqueCountries,
      types: uniqueTypes
    };
  }, [partnerGuides]);

  // Filter partner guides
  const filteredGuides = useMemo(() => {
    let filtered = partnerGuides;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(guide => 
        guide.name?.toLowerCase().includes(searchLower) ||
        guide.description?.toLowerCase().includes(searchLower) ||
        guide.destination_name?.toLowerCase().includes(searchLower) ||
        guide.country?.toLowerCase().includes(searchLower)
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(guide => guide.region === selectedRegion);
    }

    // Country filter
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(guide => guide.country === selectedCountry);
    }

    // Destination filter
    if (selectedDestination !== 'all') {
      filtered = filtered.filter(guide => 
        guide.destination_id === selectedDestination || 
        guide.destination_name?.toLowerCase() === selectedDestination.toLowerCase()
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(guide => guide.guide_type === selectedType);
    }

    return filtered;
  }, [partnerGuides, searchTerm, selectedRegion, selectedCountry, selectedDestination, selectedType]);

  // Check if we have any guides to show filters
  const hasGuides = partnerGuides.length > 0;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('partner_guides')
        .insert({
          name: formData.name,
          url: formData.url,
          description: formData.description,
          destination_name: formData.destination,
          guide_type: formData.type || 'website',
          submitted_by: formData.email,
          is_approved: false, // Requires admin approval
          is_active: false
        });

      if (error) throw error;

      toast({
        title: 'Submission received!',
        description: 'We\'ll review your guide and add it to our directory soon.',
      });

      // Reset form
      setFormData({
        name: '',
        url: '',
        description: '',
        destination: '',
        type: 'website',
        email: ''
      });
      setShowSubmissionForm(false);
    } catch (error) {
      console.error('Error submitting guide:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit guide. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NavigationNext />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Hero Section */}
        <section className="pt-24 pb-12 ocean-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white mb-6">
                Partner Travel Guides & Resources
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Discover curated travel guides, blogs, and helpful resources for destinations worldwide
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Section - Only show if there are guides or always show submit button */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search - Only show if there are guides */}
              {hasGuides && (
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search guides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              )}

              {/* Region Filter - Only show if there are multiple regions */}
              {availableFilters.regions.length > 1 && (
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border rounded-lg h-12 bg-white"
                >
                  <option value="all">All Regions</option>
                  {availableFilters.regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              )}

              {/* Country Filter - Only show if there are multiple countries */}
              {availableFilters.countries.length > 1 && (
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-4 py-2 border rounded-lg h-12 bg-white"
                >
                  <option value="all">All Countries</option>
                  {availableFilters.countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              )}

              {/* Type Filter - Only show if there are multiple types */}
              {availableFilters.types.length > 1 && (
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border rounded-lg h-12 bg-white"
                >
                  <option value="all">All Types</option>
                  {availableFilters.types.includes('website') && <option value="website">Travel Websites</option>}
                  {availableFilters.types.includes('blog') && <option value="blog">Travel Blogs</option>}
                  {availableFilters.types.includes('official_guide') && <option value="official_guide">Official Guides</option>}
                  {availableFilters.types.includes('resource') && <option value="resource">Other Resources</option>}
                </select>
              )}

              {/* Submit Button - Always show */}
              <Button
                onClick={() => setShowSubmissionForm(true)}
                className={`h-12 px-6 sunset-gradient text-white ${!hasGuides ? 'flex-1' : ''}`}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Guide
              </Button>
            </div>
          </div>
        </section>

        {/* Partner Guides Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-4 text-gray-600">Loading guides...</p>
              </div>
            ) : partnerGuides.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Be the First to Share Your Guide!</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                  We're building a directory of quality travel guides. Submit yours to help fellow travelers discover amazing destinations.
                </p>
                <Button
                  onClick={() => setShowSubmissionForm(true)}
                  className="sunset-gradient text-white px-8 py-3"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Your Guide
                </Button>
              </div>
            ) : filteredGuides.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No guides found matching your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRegion('all');
                    setSelectedCountry('all');
                    setSelectedType('all');
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map((guide) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Screenshot */}
                          {guide.screenshot_url ? (
                            <div className="mb-4 rounded-lg overflow-hidden border">
                              <Image
                                src={guide.screenshot_url}
                                alt={guide.name}
                                width={400}
                                height={250}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="mb-4 rounded-lg bg-gray-100 h-48 flex items-center justify-center">
                              <Globe className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          {/* Name */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {guide.name}
                          </h3>

                          {/* Description */}
                          {guide.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {guide.description}
                            </p>
                          )}

                          {/* Location Badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.guide_type && (
                              <Badge variant="secondary" className="text-xs">
                                {guide.guide_type === 'blog' ? 'Blog' : 
                                 guide.guide_type === 'official_guide' ? 'Official Guide' :
                                 guide.guide_type === 'resource' ? 'Resource' : 'Website'}
                              </Badge>
                            )}
                            {guide.destination_name && (
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {guide.destination_name}
                              </Badge>
                            )}
                            {guide.country && (
                              <Badge variant="outline" className="text-xs">
                                {guide.country}
                              </Badge>
                            )}
                          </div>

                          {/* Visit Button */}
                          <Button
                            asChild
                            className="w-full"
                            variant="outline"
                          >
                            <a
                              href={guide.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              Visit Guide
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Submission Form Modal */}
        {showSubmissionForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Submit Your Travel Guide</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmissionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guide Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Aruba.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL *
                    </label>
                    <Input
                      required
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination *
                    </label>
                    <Input
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g., Aruba"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type || 'website'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="website">Travel Website</option>
                      <option value="blog">Travel Blog</option>
                      <option value="official_guide">Official Guide</option>
                      <option value="resource">Other Resource</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of your travel guide..."
                      className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sunset-gradient text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Guide
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSubmissionForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Partner With Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Want to Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We're always looking to partner with quality travel guide websites. 
              Submit your guide above or contact us directly.
            </p>
            <Button
              asChild
              className="sunset-gradient text-white"
            >
              <a href="mailto:mail@toptours.ai">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </section>
      </div>
      <FooterNext />
    </>
  );
}
