'use client';

import { useState, useEffect, useMemo } from 'react';
import RestaurantsHubClient from './RestaurantsHubClient';

export default function RestaurantsPageClient({ destinations, totalRestaurants = 0 }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((dest) => {
        const matchesSearch =
          !searchTerm.trim() ||
          dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.country?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' || dest.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort alphabetically by name (A to Z)
        return a.name.localeCompare(b.name);
      });
  }, [destinations, searchTerm, selectedCategory]);

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
    <RestaurantsHubClient
      destinations={paginatedDestinations}
      totalDestinations={filteredDestinations.length}
      totalRestaurants={totalRestaurants}
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
