"use client";
import { useState } from 'react';
import BlogPostContent from './BlogPostContent';
import SmartTourFinder from '@/components/home/SmartTourFinder';

export default function TravelGuideClient({ slug }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilledDestination, setPreFilledDestination] = useState('');
  
  const handleOpenModal = () => {
    setPreFilledDestination('');
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <BlogPostContent slug={slug} onOpenModal={handleOpenModal} />
      
      <SmartTourFinder
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preFilledDestination={preFilledDestination}
      />
    </>
  );
}

