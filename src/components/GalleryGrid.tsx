import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: number;
  category: 'Events' | 'Competitions' | 'Campus Life';
  title: string;
  caption: string;
  gradient: string;
  artType: 'apothecary' | 'stage' | 'lab' | 'trophy' | 'notes' | 'rally' | 'science' | 'book' | 'microscope';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    category: 'Events',
    title: 'Annual Fest "AURA 2026"',
    caption: 'Students showcasing rich traditional performances during the cultural inaugural night.',
    gradient: 'from-orange-burnt to-[#8F2E05]',
    artType: 'stage'
  },
  {
    id: 2,
    category: 'Competitions',
    title: 'Pharma Quiz Winners',
    caption: 'Our top academic team receiving the regional champions trophy at the sports auditorium.',
    gradient: 'from-[#11234F] to-[#0A1430]',
    artType: 'trophy'
  },
  {
    id: 3,
    category: 'Campus Life',
    title: 'College Main Campus',
    caption: 'The front entrance and beautiful facade of TGPCOP college buildings in Nagpur.',
    gradient: 'from-[#0D1B3E] to-[#1A367C]',
    artType: 'apothecary'
  },
  {
    id: 4,
    category: 'Events',
    title: 'Mega Blood Donation',
    caption: 'TGPCOP NSS unit coordinating the community care drive with local Nagpur blood banks.',
    gradient: 'from-[#C84B0E] to-[#E65F1B]',
    artType: 'rally'
  },
  {
    id: 5,
    category: 'Competitions',
    title: 'NDDS Poster Entries',
    caption: 'Innovative drug coating formulas presented to elite judges from the pharmaceutical sector.',
    gradient: 'from-[#0A1430] to-orange-burnt',
    artType: 'science'
  },
  {
    id: 6,
    category: 'Campus Life',
    title: 'Central Formulations Lab',
    caption: 'Students practicing analytical testing and formulation preparation under expert supervision.',
    gradient: 'from-[#8F2E05] to-orange-burnt',
    artType: 'lab'
  },
  {
    id: 7,
    category: 'Events',
    title: 'World Pharmacist Day',
    caption: 'An energetic rally propagating awareness about primary healthcare in Mohgaon villages.',
    gradient: 'from-[#11234F] to-orange-burnt',
    artType: 'notes'
  },
  {
    id: 8,
    category: 'Campus Life',
    title: 'Pharmacy Central Library',
    caption: 'Equipped with over 5,000 reference pharmacopoeias and extensive computer search nodes.',
    gradient: 'from-[#0D1B3E] to-[#050D21]',
    artType: 'book'
  },
  {
    id: 9,
    category: 'Competitions',
    title: 'Drug Innovation Challenge',
    caption: 'Presenting outstanding chemical formulas for localized capsule delivery systems.',
    gradient: 'from-[#E65F1B] to-[#C84B0E]',
    artType: 'microscope'
  }
];

export const GalleryGrid: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Events' | 'Competitions' | 'Campus Life'>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeFilter === 'All' || item.category === activeFilter
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const prevIdx = lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1;
    setLightboxIndex(prevIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    const nextIdx = lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1;
    setLightboxIndex(nextIdx);
  };

  // Render SVG illustration inside placeholder cards to look highly customized
  const renderArt = (type: string) => {
    switch (type) {
      case 'stage':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'trophy':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 4h4M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
          </svg>
        );
      case 'lab':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 00-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'science':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'notes':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'microscope':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h4M8 17h8m-8-4h8m-4-8v8M4 5h16" />
          </svg>
        );
      case 'rally':
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'apothecary':
      default:
        return (
          <svg className="w-16 h-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517L12 10V5m0 0L9 8m3-3L15 8" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters Strip */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
        {(['All', 'Events', 'Competitions', 'Campus Life'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full font-display text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeFilter === filter
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/25 scale-105'
                : 'bg-white hover:bg-navy-dark hover:text-white text-navy-dark/70 border border-navy-dark/5 shadow-sm'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid Track */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              onClick={() => setLightboxIndex(index)}
              className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer border border-navy-dark/5 group transition-shadow duration-300"
            >
              {/* Premium custom Vector Backdrop */}
              <div className={`relative h-56 bg-gradient-to-tr ${item.gradient} flex items-center justify-center overflow-hidden`}>
                {/* Visual compound grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] bg-[size:20px_20px] opacity-10" />
                
                {/* Floating SVG art */}
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  {renderArt(item.artType)}
                </div>

                {/* Corner camera overlay */}
                <div className="absolute bottom-3 right-3 bg-black/40 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              {/* Caption Card Body */}
              <div className="p-5">
                <span className="text-orange-burnt text-[10px] font-bold uppercase tracking-widest block mb-1">
                  {item.category}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-navy-dark mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-navy-dark/70 text-xs sm:text-sm font-sans line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal Drawer Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md"
          >
            {/* Header controls strip */}
            <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto z-10 pt-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold tracking-wider bg-white/10 px-4 py-1.5 rounded-full uppercase">
                <ImageIcon className="w-4 h-4 text-orange-burnt" />
                <span>
                  {filteredItems[lightboxIndex].category} ({lightboxIndex + 1}/{filteredItems.length})
                </span>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-burnt flex items-center justify-center transition-colors text-white"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Central Slide Display */}
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto flex-grow my-4 relative">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-0 sm:left-4 z-10 w-12 h-12 rounded-full bg-white/5 hover:bg-orange-burnt text-white flex items-center justify-center transition-colors shrink-0 backdrop-blur-sm"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Central Vector Content container */}
              <motion.div
                key={filteredItems[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl aspect-[4/3] rounded-2xl mx-auto bg-gradient-to-br ${filteredItems[lightboxIndex].gradient} flex items-center justify-center relative shadow-2xl overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
                <div className="transform scale-[2.2]">
                  {renderArt(filteredItems[lightboxIndex].artType)}
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-0 sm:right-4 z-10 w-12 h-12 rounded-full bg-white/5 hover:bg-orange-burnt text-white flex items-center justify-center transition-colors shrink-0 backdrop-blur-sm"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Footer captions area */}
            <div className="text-center text-white max-w-3xl mx-auto w-full pb-4">
              <h4 className="font-display font-bold text-lg sm:text-2xl mb-2 text-gold-accent">
                {filteredItems[lightboxIndex].title}
              </h4>
              <p className="text-white/80 text-xs sm:text-base leading-relaxed font-sans px-4">
                {filteredItems[lightboxIndex].caption}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryGrid;
