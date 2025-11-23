'use client';

import { useState, useEffect, useMemo } from 'react';
import ToursHubClient from './ToursHubClient';
import { destinations } from '@/data/destinationsData';
import viatorDestinationsClassifiedData from '@/data/viatorDestinationsClassified.json';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';

// Use classified destinations (has region/country data)
const viatorDestinationsClassified = Array.isArray(viatorDestinationsClassifiedData) ? viatorDestinationsClassifiedData : null;

// Helper to generate slug (same as used elsewhere)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map OpenAI regions to our category names
const regionToCategory = {
  'Europe': 'Europe',
  'North America': 'North America',
  'Caribbean': 'Caribbean',
  'Asia-Pacific': 'Asia-Pacific',
  'Africa': 'Africa',
  'South America': 'South America',
  'Middle East': 'Middle East',
  'Australia': 'Asia-Pacific',
  'Oceania': 'Asia-Pacific',
  'Australia & Oceania': 'Asia-Pacific',
  'Central America': 'North America',
  'Asia': 'Asia-Pacific',
  'Central Asia': 'Asia-Pacific',
};

export default function ToursPageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Combine regular destinations with Viator destinations (all 3382)
  const allDestinations = useMemo(() => {
    const regularDests = (Array.isArray(destinations) ? destinations : []).map(dest => ({
      ...dest,
      isViator: false,
    }));
    
    // Always include Viator destinations (no filter needed)
    const classifiedData = Array.isArray(viatorDestinationsClassified) ? viatorDestinationsClassified : [];
    
    // Create normalized names from our curated destinations for matching
    const curatedBaseNames = new Set();
    const curatedFullNames = new Set();
    
    regularDests.forEach(dest => {
      const name = (dest.name || '').toLowerCase().trim();
      const fullName = (dest.fullName || dest.name || '').toLowerCase().trim();
      
      curatedBaseNames.add(name);
      curatedFullNames.add(fullName);
      
      const baseName = fullName.split(',')[0].trim();
      if (baseName && baseName !== fullName) {
        curatedBaseNames.add(baseName);
      }
    });
    
    const matchesCurated = (viatorName) => {
      const normalized = viatorName.toLowerCase().trim();
      const baseName = normalized.split(',')[0].trim();
      
      if (curatedBaseNames.has(normalized) || curatedFullNames.has(normalized)) {
        return true;
      }
      
      if (curatedBaseNames.has(baseName) || curatedFullNames.has(baseName)) {
        return true;
      }
      
      return false;
    };
    
    const seenViatorNames = new Set();
    
    const viatorDests = classifiedData
      .filter(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        if (!destName) return false;
        
        const normalized = destName.toLowerCase().trim();
        
        if (matchesCurated(destName)) {
          return false;
        }
        
        const country = (classifiedDest.country || '').toLowerCase();
        const nameCountryKey = `${normalized}|${country}`;
        if (seenViatorNames.has(nameCountryKey)) {
          return false;
        }
        
        seenViatorNames.add(nameCountryKey);
        return true;
      })
      .map(classifiedDest => {
        const destName = classifiedDest.destinationName || classifiedDest.name || '';
        const slug = generateSlug(destName);
        
        const region = classifiedDest.region || null;
        const country = classifiedDest.country || null;
        const category = region ? (regionToCategory[region] || region) : null;
        
        const seoContent = getDestinationSeoContent(slug);
        
        return {
          id: slug,
          name: destName,
          fullName: destName,
          briefDescription: seoContent?.briefDescription || `Discover tours and activities in ${destName}`,
          heroDescription: seoContent?.heroDescription || null,
          category: category,
          region: region,
          country: country,
          imageUrl: null,
          isViator: true,
          viatorId: classifiedDest.destinationId || classifiedDest.id,
          seo: seoContent?.seo || null,
        };
      });
    
    return [...regularDests, ...viatorDests];
  }, [destinations, viatorDestinationsClassified]);

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return allDestinations.filter(dest => {
      if (!searchTerm.trim() && selectedCategory === 'All') {
        return true;
      }
      
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm.trim() || 
                           dest.name.toLowerCase().includes(searchLower) ||
                           (dest.fullName && dest.fullName.toLowerCase().includes(searchLower)) ||
                           (dest.briefDescription && dest.briefDescription.toLowerCase().includes(searchLower)) ||
                           (dest.country && dest.country.toLowerCase().includes(searchLower));
      
      const matchesCategory = selectedCategory === 'All' || 
                           (dest.category && dest.category === selectedCategory) ||
                           (dest.region && regionToCategory[dest.region] === selectedCategory) ||
                           (dest.region && dest.region === selectedCategory);
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      // Sort by category first, then by name
      if (a.category !== b.category) {
        const categoryOrder = ['Europe', 'North America', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East'];
        const aIndex = categoryOrder.indexOf(a.category || '');
        const bIndex = categoryOrder.indexOf(b.category || '');
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [allDestinations, searchTerm, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDestinations = filteredDestinations.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.trim() && selectedCategory !== 'All') {
      setSelectedCategory('All');
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <ToursHubClient
      destinations={paginatedDestinations}
      totalDestinations={filteredDestinations.length}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      searchTerm={searchTerm}
      selectedCategory={selectedCategory}
      onSearchChange={handleSearchChange}
      onCategoryChange={handleCategoryChange}
      onOpenModal={handleOpenModal}
      onCloseModal={handleCloseModal}
      isModalOpen={isModalOpen}
    />
  );
}

