import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GalleryItem {
  id: string;
  category: 'Events' | 'Competitions' | 'Campus Life' | 'General';
  title: string;
  image_url: string;
  created_at: string;
}

export const GalleryGrid: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Events' | 'Competitions' | 'Campus Life' | 'General'>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      console.error('Error querying gallery feed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredItems(photos);
    } else {
      setFilteredItems(photos.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase()));
    }
  }, [photos, activeFilter]);

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

  // Flickering skeleton loaders grid
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-navy-dark/5 animate-pulse">
          <div className="h-56 bg-navy-dark/5" />
          <div className="p-5 space-y-3">
            <div className="h-3.5 bg-navy-dark/5 rounded w-1/4" />
            <div className="h-5 bg-navy-dark/5 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters Strip */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
        {(['All', 'Events', 'Competitions', 'Campus Life', 'General'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full font-display text-xs sm:text-sm font-semibold transition-all duration-350 ${
              activeFilter === filter
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/25 scale-105'
                : 'bg-white hover:bg-navy-dark hover:text-white text-navy-dark/70 border border-navy-dark/5 shadow-xs'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main visual layouts */}
      {isLoading ? (
        <SkeletonGrid />
      ) : filteredItems.length > 0 ? (
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-navy-dark/5 group transition-all duration-300"
              >
                {/* Real Image Card Display */}
                <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                  />
                  
                  {/* Corner camera overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/40 p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Title Details */}
                <div className="p-5 space-y-2">
                  <span className="text-orange-burnt text-[10px] font-bold uppercase tracking-widest block leading-none">
                    {item.category}
                  </span>
                  <h3 className="font-display font-extrabold text-base text-navy-dark leading-snug">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-navy-dark/10 rounded-2xl px-6 max-w-2xl mx-auto shadow-sm">
          <Camera className="w-12 h-12 text-navy-dark/15 mx-auto mb-4" />
          <h3 className="font-display font-extrabold text-base text-navy-dark uppercase tracking-wider">
            📸 Photos coming soon!
          </h3>
          <p className="text-xs text-navy-dark/50 max-w-xs mx-auto mt-1.5 leading-relaxed font-sans">
            The Student Council has not uploaded any visual memories to this category yet. Check back soon for snapshots of sports fests, cultural nights, and campus life!
          </p>
        </div>
      )}

      {/* Lightbox Drawer Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between text-white w-full max-w-7xl mx-auto z-10 pt-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold tracking-wider bg-white/10 px-4 py-1.5 rounded-full uppercase">
                <ImageIcon className="w-4 h-4 text-orange-burnt" />
                <span>
                  {filteredItems[lightboxIndex].category} ({lightboxIndex + 1}/{filteredItems.length})
                </span>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-burnt flex items-center justify-center transition-colors text-white outline-none"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Central image slide */}
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto flex-grow my-4 relative">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-0 sm:left-4 z-10 w-12 h-12 rounded-full bg-white/5 hover:bg-orange-burnt text-white flex items-center justify-center transition-colors shrink-0 backdrop-blur-xs"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Central vector container */}
              <motion.div
                key={filteredItems[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl aspect-[4/3] rounded-2xl mx-auto bg-gray-900/50 flex items-center justify-center relative shadow-2xl overflow-hidden border border-white/5"
              >
                <img
                  src={filteredItems[lightboxIndex].image_url}
                  alt={filteredItems[lightboxIndex].title}
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-0 sm:right-4 z-10 w-12 h-12 rounded-full bg-white/5 hover:bg-orange-burnt text-white flex items-center justify-center transition-colors shrink-0 backdrop-blur-xs"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Footer details */}
            <div className="text-center text-white max-w-3xl mx-auto w-full pb-4">
              <h4 className="font-display font-extrabold text-base sm:text-xl mb-1 text-orange-burnt">
                {filteredItems[lightboxIndex].title}
              </h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryGrid;
