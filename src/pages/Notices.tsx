import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoticeCard } from '../components/NoticeCard';
import { notices } from '../data/notices';
import { Megaphone } from 'lucide-react';

export const Notices: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Academic' | 'Event' | 'Alert' | 'General'>('All');

  // Filter notices based on selection
  const filteredNotices = notices.filter(
    (n) => activeFilter === 'All' || n.category === activeFilter
  );

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-12 h-12 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt"
          >
            <Megaphone className="w-6 h-6" />
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-burnt text-xs font-bold uppercase tracking-widest block"
          >
            Campus Notice Board
          </motion.span>

          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark leading-tight"
            >
              OFFICIAL ANNOUNCEMENTS
            </motion.h1>
            
            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="h-1 bg-orange-burnt mx-auto mt-4 rounded-full"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-navy-dark/70 text-sm sm:text-base font-sans"
          >
            Stay updated with examinations schedules, blood donation campaigns, anti-ragging warnings, and study resources published by the council.
          </motion.p>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {(['All', 'Academic', 'Event', 'Alert', 'General'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 sm:py-2.5 rounded-full font-display text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/25 scale-105'
                  : 'bg-white hover:bg-navy-dark hover:text-white text-navy-dark/70 border border-navy-dark/5 shadow-sm'
              }`}
            >
              {filter === 'Event' ? 'Events' : filter === 'Alert' ? 'Alerts' : filter}
            </button>
          ))}
        </div>

        {/* Pinboard Grid Track */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State visual */}
        {filteredNotices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-xl shadow-sm border border-navy-dark/5"
          >
            <p className="text-navy-dark/50 text-base font-display">No notices found in this category.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Notices;
