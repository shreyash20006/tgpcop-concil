import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { EventTimeline } from '../components/EventTimeline';
import { CompetitionCard } from '../components/CompetitionCard';
import { EventScheduleSection } from '../components/EventScheduleSection';
import { supabase } from '../lib/supabase';
import { CalendarRange, Trophy, CalendarDays, CalendarCheck, Rocket } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ScienceBackground } from '../components/ScienceBackground';
import { timelineEvents as staticTimelineEvents, competitions as staticCompetitions } from '../data/events';

type TabType = 'schedule' | 'events' | 'competitions';

export const Events: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'schedule';
  const [activeTab, setActiveTab] = useState<TabType>(
    ['schedule', 'events', 'competitions'].includes(initialTab) ? initialTab : 'schedule'
  );
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.warn('Live events DB fetch returned error or was empty, using verified council records:', err.message);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Split database events with static fallback
  const timelineEvents = React.useMemo(() => {
    const dbTimeline = events.filter((e) => e.type === 'event');
    return dbTimeline.length > 0 ? dbTimeline : staticTimelineEvents;
  }, [events]);

  const competitions = React.useMemo(() => {
    const dbComps = events.filter((e) => e.type === 'competition');
    return dbComps.length > 0 ? dbComps : staticCompetitions;
  }, [events]);

  const handleTabChange = React.useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'schedule':
        return {
          icon: <CalendarCheck className="w-6 h-6 animate-pulse text-orange-burnt" />,
          title: "5-Day Event Schedule",
          subtitle: "Induction Programme, Cultural Week, Traditional Garba, and E-Sports Championship (Oct 13 – 17, 2026).",
          breadcrumb: "Event Schedule"
        };
      case 'events':
        return {
          icon: <CalendarRange className="w-6 h-6 animate-pulse text-orange-burnt" />,
          title: "Events & Timeline",
          subtitle: "Discover scientific drug delivery challenges, technical symposiums, research forums, and campus cultural week contests.",
          breadcrumb: "Events Timeline"
        };
      case 'competitions':
      default:
        return {
          icon: <Trophy className="w-6 h-6 animate-pulse text-orange-burnt" />,
          title: "Active Competitions",
          subtitle: "Compete in pharmacy quizzes, scientific cartooning, campus reel making, and e-sports tourneys.",
          breadcrumb: "Competitions"
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="relative min-h-screen bg-[#050B18] overflow-hidden pb-24">
      {/* Background Molecular Animations & Tech Elements */}
      <ScienceBackground />
      <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      {/* Reusable Science Page Header */}
      <PageHeader
        icon={headerInfo.icon}
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        breadcrumb={headerInfo.breadcrumb}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* 3-Toggle Selector Tabs with smooth layout slider */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white/5 p-1.5 rounded-2xl flex flex-wrap justify-center gap-1.5 border border-white/5 backdrop-blur-xl relative">
            {/* Tab 1: Event Schedule */}
            <button
              onClick={() => handleTabChange('schedule')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative z-10 ${
                activeTab === 'schedule' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-orange-burnt" />
              <span>5-Day Schedule</span>
              {activeTab === 'schedule' && (
                <motion.div
                  layoutId="activeTabSelectorBg"
                  className="absolute inset-0 bg-[#0F1E42] rounded-xl border border-white/10 shadow-lg -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
            </button>

            {/* Tab 2: Timeline */}
            <button
              onClick={() => handleTabChange('events')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative z-10 ${
                activeTab === 'events' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-orange-burnt" />
              <span>Timeline</span>
              {activeTab === 'events' && (
                <motion.div
                  layoutId="activeTabSelectorBg"
                  className="absolute inset-0 bg-[#0F1E42] rounded-xl border border-white/10 shadow-lg -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
            </button>

            {/* Tab 3: Competitions */}
            <button
              onClick={() => handleTabChange('competitions')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative z-10 ${
                activeTab === 'competitions' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 text-orange-burnt" />
              <span>Competitions</span>
              {activeTab === 'competitions' && (
                <motion.div
                  layoutId="activeTabSelectorBg"
                  className="absolute inset-0 bg-[#0F1E42] rounded-xl border border-white/10 shadow-lg -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
            </button>

            {/* Host on Unstop Button */}
            <Link
              to="/host"
              className="flex items-center space-x-2 px-5 py-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 text-orange-burnt bg-orange-burnt/10 hover:bg-orange-burnt hover:text-white border border-orange-burnt/30 shadow-sm"
              title="Host your own Hackathon, Quiz or Cultural Event like on Unstop"
            >
              <Rocket className="w-4 h-4" />
              <span>Host on Unstop</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Display Panel */}
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <EventScheduleSection showTitle={false} />
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <EventTimeline events={timelineEvents} />
            </motion.div>
          )}

          {activeTab === 'competitions' && (
            <motion.div
              key="competitions-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto py-4">
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
