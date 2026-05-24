import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoticeCard } from '../components/NoticeCard';
import { supabase } from '../lib/supabase';
import { Megaphone, RefreshCw } from 'lucide-react';

export const Notices: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Academic' | 'Event' | 'Alert' | 'General'>('All');
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Error fetching notices:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(
    (n) => activeFilter === 'All' || n.category === activeFilter
  );

  return (
    <div className="relative min-h-screen bg-[#050B18] pt-32 pb-24 overflow-hidden">
      {/* Background colorful orbs and noise */}
      <div className="absolute top-[20%] left-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-12 h-12 rounded-xl bg-orange-burnt/10 flex items-center justify-center text-orange-burnt border border-orange-burnt/20 shadow-lg"
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
              className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight uppercase"
            >
              Official Announcements
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="h-1 bg-gradient-to-r from-orange-burnt to-gold-accent mx-auto mt-4 rounded-full"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm sm:text-base font-sans"
          >
            Stay updated with examinations schedules, blood donation campaigns, anti-ragging warnings, and study resources published by the council.
          </motion.p>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-16">
          {(['All', 'Academic', 'Event', 'Alert', 'General'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 sm:py-3 rounded-xl font-display text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 relative border ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-orange-burnt to-[#E06D2B] text-white border-transparent shadow-lg shadow-orange-burnt/15 scale-102'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/5'
              }`}
            >
              {filter === 'Event' ? 'Events' : filter === 'Alert' ? 'Alerts' : filter}
            </button>
          ))}
        </div>

        {/* Dynamic Fetching States */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 h-64 overflow-hidden relative"
              >
                <div className="absolute inset-0 shimmer pointer-events-none" />
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 bg-white/5 w-20 rounded-full border border-white/5" />
                  <div className="h-5 bg-white/5 w-16 rounded-full border border-white/5" />
                </div>
                <div className="h-6 bg-white/5 w-3/4 rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 bg-white/5 w-full rounded" />
                  <div className="h-3.5 bg-white/5 w-5/6 rounded" />
                </div>
                <div className="h-10 bg-white/5 w-full rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid layout with layout animation */}
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

            {/* Empty State */}
            {filteredNotices.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-panel rounded-2xl border border-white/5 max-w-lg mx-auto flex flex-col items-center p-6 shadow-2xl"
              >
                <RefreshCw className="w-12 h-12 text-white/10 mb-4 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="font-display font-bold text-white/70 mb-1">Notice Board is Empty</h3>
                <p className="text-white/50 text-sm font-sans">No notice board items are currently active in this category.</p>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Notices;
