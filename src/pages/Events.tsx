import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventTimeline } from '../components/EventTimeline';
import { CompetitionCard } from '../components/CompetitionCard';
import { competitions } from '../data/events';
import { CalendarRange, Trophy, CalendarDays } from 'lucide-react';

export const Events: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'competitions'>('events');

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
            {activeTab === 'events' ? (
              <CalendarRange className="w-6 h-6" />
            ) : (
              <Trophy className="w-6 h-6" />
            )}
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-burnt text-xs font-bold uppercase tracking-widest block"
          >
            Campus Happenings & Contests
          </motion.span>

          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark leading-tight uppercase"
            >
              {activeTab === 'events' ? 'EVENTS TIMELINE' : 'ACTIVE COMPETITIONS'}
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
            Explore our rich history of technical symposiums, cultural nights, and community campaigns, or participate in live scientific competitions!
          </motion.p>
        </div>

        {/* Toggle Selector Tabs */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-navy-dark/5 p-1.5 rounded-xl flex space-x-1 border border-navy-dark/5 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === 'events'
                  ? 'bg-navy-dark text-white shadow-md'
                  : 'text-navy-dark/75 hover:bg-navy-dark/5 hover:text-navy-dark'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-orange-burnt" />
              <span>Upcoming Events</span>
            </button>
            <button
              onClick={() => setActiveTab('competitions')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === 'competitions'
                  ? 'bg-navy-dark text-white shadow-md'
                  : 'text-navy-dark/75 hover:bg-navy-dark/5 hover:text-navy-dark'
              }`}
            >
              <Trophy className="w-4 h-4 text-orange-burnt" />
              <span>Competitions</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Panel with framer motion slide transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'events' ? (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.3 }}
            >
              <EventTimeline />
            </motion.div>
          ) : (
            <motion.div
              key="competitions-tab"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.3 }}
            >
              {/* Competitions Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-8">
                {competitions.map((comp) => (
                  <CompetitionCard key={comp.id} competition={comp} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Events;
