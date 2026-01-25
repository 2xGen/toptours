"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ExternalTravelGuidesClient({ regions = [], countries = [], destinations = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Filter destinations based on search and filters
  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => {
      const matchesSearch = !searchTerm || 
        dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.region?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = !selectedRegion || dest.region === selectedRegion;
      const matchesCountry = !selectedCountry || dest.country === selectedCountry;

      return matchesSearch && matchesRegion && matchesCountry;
    });
  }, [destinations, searchTerm, selectedRegion, selectedCountry]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-gray-800 mb-4">
            External Travel Guides Directory
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover curated travel guides and resources for destinations worldwide. Find expert guides, local insights, and comprehensive travel information.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search destinations, countries, or regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {regions.length > 0 && (
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            )}

            {countries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            )}

            {(selectedRegion || selectedCountry || searchTerm) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('');
                  setSelectedCountry('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {dest.name || 'Destination'}
                    </h3>
                    {dest.region && (
                      <Badge variant="outline" className="ml-2">
                        {dest.region}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {dest.country && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {dest.country}
                      </div>
                    )}
                    {dest.region && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Globe className="w-4 h-4 mr-2" />
                        {dest.region}
                      </div>
                    )}
                  </div>

                  {dest.slug && (
                    <Link
                      href={`/destinations/${dest.slug}`}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View Destination
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No destinations found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('');
                setSelectedCountry('');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
