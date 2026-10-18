import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, Trophy, BookOpen, Music, Award, Accessibility, 
  ArrowRight, Heart, Users, Hourglass, RefreshCw, CalendarCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EventScheduleSection } from '../../components/EventScheduleSection';
import { timelineEvents as staticTimelineEvents, competitions as staticCompetitions } from '../../data/events';

type MobileEventsTab = 'schedule' | 'events' | 'competitions';

export const Events: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileEventsTab>('schedule');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Load saved bookmarks from localStorage
  const loadSavedEvents = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem('tgpcop_saved_events') || '[]');
    setSavedEventIds(stored);
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.warn('Error fetching mobile events, falling back to static council records:', err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    loadSavedEvents();
    
    // Check if dashboard sent a redirect filter
    const dashboardFilter = localStorage.getItem('tgpcop-mobile-events-filter');
    if (dashboardFilter === 'competitions') {
      setActiveTab('competitions');
      localStorage.removeItem('tgpcop-mobile-events-filter');
    } else if (dashboardFilter === 'schedule') {
      setActiveTab('schedule');
      localStorage.removeItem('tgpcop-mobile-events-filter');
    }
  }, [loadSavedEvents]);

  // Split database events by type with static fallback
  const allTimelineEvents = useMemo(() => {
    const dbTimeline = events.filter((e) => e.type === 'event');
    return dbTimeline.length > 0 ? dbTimeline : staticTimelineEvents;
  }, [events]);

  const allCompetitions = useMemo(() => {
    const dbComps = events.filter((e) => e.type === 'competition');
    return dbComps.length > 0 ? dbComps : staticCompetitions;
  }, [events]);

  // Categories list based on active tab
  const categories = useMemo(() => {
    const activeList = activeTab === 'events' ? allTimelineEvents : allCompetitions;
    const cats = new Set<string>();
    activeList.forEach(item => {
      if (item.category) cats.add(item.category);
      else if (item.name?.toLowerCase().includes('exam') || item.title?.toLowerCase().includes('exam')) cats.add('Academic');
      else if (item.name?.toLowerCase().includes('fest') || item.title?.toLowerCase().includes('fest')) cats.add('Cultural');
      else cats.add('General');
    });
    return ['All', ...Array.from(cats)];
  }, [activeTab, allTimelineEvents, allCompetitions]);

  const filteredEvents = useMemo(() => {
    const activeList = activeTab === 'events' ? allTimelineEvents : allCompetitions;
    if (activeCategoryFilter === 'All') return activeList;
    return activeList.filter(e => {
      const cat = e.category || (e.name?.toLowerCase().includes('exam') || e.title?.toLowerCase().includes('exam') ? 'Academic' : e.name?.toLowerCase().includes('fest') || e.title?.toLowerCase().includes('fest') ? 'Cultural' : 'General');
      return cat === activeCategoryFilter;
    });
  }, [activeTab, allTimelineEvents, allCompetitions, activeCategoryFilter]);

  const handleTabChange = (tab: MobileEventsTab) => {
    setActiveTab(tab);
    setActiveCategoryFilter('All');
  };

  const toggleBookmark = (eventId: string) => {
    const stored: string[] = JSON.parse(localStorage.getItem('tgpcop_saved_events') || '[]');
    let updated;
    if (stored.includes(eventId)) {
      updated = stored.filter(id => id !== eventId);
    } else {
      updated = [...stored, eventId];
    }
    localStorage.setItem('tgpcop_saved_events', JSON.stringify(updated));
    setSavedEventIds(updated);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat === 'academic') return <BookOpen className="w-4 h-4" />;
    if (cat === 'cultural') return <Music className="w-4 h-4" />;
    if (cat === 'sports') return <Award className="w-4 h-4" />;
    return <Accessibility className="w-4 h-4" />;
  };

  // Countdown Helper component
  const CountdownBadge: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; isExpired: boolean }>({
      days: 0, hours: 0, minutes: 0, isExpired: false
    });

    useEffect(() => {
      const calculate = () => {
        const diff = new Date(targetDate).getTime() - new Date().getTime();
        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true });
          return;
        }
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          isExpired: false
        });
      };
      calculate();
      const t = setInterval(calculate, 60000);
      return () => clearInterval(t);
    }, [targetDate]);

    if (timeLeft.isExpired) {
      return (
        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Ended
        </span>
      );
    }

    return (
      <span className="bg-orange-burnt/10 text-orange-burnt border border-orange-burnt/35 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
        <Hourglass className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h left
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-6 pt-4">
      {/* Header Section */}
      <section className="space-y-1">
        <span className="font-display text-xs font-bold text-orange-burnt tracking-widest uppercase">
          Fest & Cultural Week 2026
        </span>
        <h2 className="font-display font-extrabold text-2xl text-white tracking-tight leading-tight">
          Events & Schedules
        </h2>
        <p className="font-sans text-xs text-white/50 leading-relaxed">
          October 13–17, 2026 Induction Programme, cultural extravaganza, traditional Garba, and contests.
        </p>
      </section>

      {/* Tabs Selector Toggle */}
      <div className="flex items-center justify-center pt-1">
        <div className="bg-white/5 p-1 rounded-xl flex space-x-1 border border-white/5 backdrop-blur-xl w-full max-w-sm justify-between">
          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-display text-xs font-bold transition-all ${
              activeTab === 'schedule' ? 'bg-[#0F1E42] text-white border border-white/5 shadow-md' : 'text-white/60'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-orange-burnt" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-display text-xs font-bold transition-all ${
              activeTab === 'events' ? 'bg-[#0F1E42] text-white border border-white/5 shadow-md' : 'text-white/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-burnt" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => handleTabChange('competitions')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg font-display text-xs font-bold transition-all ${
              activeTab === 'competitions' ? 'bg-[#0F1E42] text-white border border-white/5 shadow-md' : 'text-white/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-orange-burnt" />
            <span>Contests</span>
          </button>
        </div>
      </div>

      {/* When Schedule Tab is Active */}
      {activeTab === 'schedule' ? (
        <div className="pt-2">
          <EventScheduleSection showTitle={false} />
        </div>
      ) : (
        <>
          {/* Categories filter chips */}
          {categories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full font-display text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeCategoryFilter === cat
                      ? 'bg-orange-burnt text-white'
                      : 'bg-white/5 text-white/50 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Events List / Timeline Grid */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((idx) => (
                <div key={idx} className="bg-[#0F1E42]/80 border border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer pointer-events-none" />
                  <div className="h-5 bg-white/5 w-24 rounded-full" />
                  <div className="h-6 bg-white/5 w-2/3 rounded" />
                  <div className="h-3 bg-white/5 w-full rounded" />
                  <div className="h-10 bg-white/5 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Connector Line */}
              {activeTab === 'events' && filteredEvents.length > 0 && (
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-orange-burnt via-gold-accent to-orange-burnt opacity-20" />
              )}

              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event) => {
                    const isSaved = savedEventIds.includes(event.id);
                    const seatsLeft = (event.capacity || 100) - (event.registered_count || 0);
                    const isFull = seatsLeft <= 0;
                    const percentFull = Math.min(100, Math.round(((event.registered_count || 0) / (event.capacity || 100)) * 100));

                    const eventCat = event.category || (event.name?.toLowerCase().includes('exam') || event.title?.toLowerCase().includes('exam') ? 'Academic' : event.name?.toLowerCase().includes('fest') || event.title?.toLowerCase().includes('fest') ? 'Cultural' : 'General');
                    
                    const formattedDate = event.date || (event.deadline ? new Date(event.deadline).toLocaleDateString('en-IN', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'TBD');

                    return (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0F1E42]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-lg group"
                      >
                        {/* Shimmer on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                        {/* Top Meta: Category + Date / Countdown */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-burnt/10 text-orange-burnt border border-orange-burnt/25">
                            {getCategoryIcon(eventCat)}
                            <span>{eventCat}</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            {event.deadline && <CountdownBadge targetDate={event.deadline} />}
                            <span className="text-[10px] font-mono text-white/50">{formattedDate}</span>
                          </div>
                        </div>

                        {/* Event / Comp Title */}
                        <h3 className="font-display font-extrabold text-lg text-white group-hover:text-orange-burnt transition-colors leading-tight mb-2">
                          {event.name || event.title}
                        </h3>

                        {/* Time & Venue if available */}
                        {(event.time || event.venue) && (
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/70 mb-2">
                            {event.time && <span className="text-amber-300">⏱️ {event.time}</span>}
                            {event.venue && <span className="text-cyan-300">📍 {event.venue}</span>}
                          </div>
                        )}

                        {/* Description */}
                        <p className="font-sans text-xs text-white/60 line-clamp-3 leading-relaxed mb-4">
                          {event.description}
                        </p>

                        {/* Coordinators note */}
                        {event.coordinators && event.coordinators.length > 0 && (
                          <div className="mb-4 text-[11px] text-white/75 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                            <span className="font-bold text-orange-burnt">Coordinators: </span>
                            {event.coordinators.join(', ')}
                          </div>
                        )}

                        {/* Capacity meter if event */}
                        {event.type === 'event' && (
                          <div className="space-y-1.5 mb-4 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center text-[10px] font-sans">
                              <span className="text-white/50 flex items-center gap-1">
                                <Users className="w-3 h-3 text-orange-burnt" />
                                <span>Seats Availability</span>
                              </span>
                              <span className={`font-mono font-bold ${isFull ? 'text-red-400' : 'text-orange-burnt'}`}>
                                {isFull ? 'Housefull' : `${seatsLeft} Left`}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFull ? 'bg-red-500' : 'bg-gradient-to-r from-orange-burnt to-[#E06D2B]'
                                }`}
                                style={{ width: `${percentFull}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Prize or Rules for competitions */}
                        {event.prize_info && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-4 text-[10px] text-amber-300 font-sans flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="line-clamp-1">{event.prize_info}</span>
                          </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                          {/* Bookmark */}
                          <button
                            onClick={() => toggleBookmark(event.id)}
                            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                              isSaved
                                ? 'bg-orange-burnt/20 border-orange-burnt/40 text-orange-burnt'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                            }`}
                            title={isSaved ? 'Bookmarked' : 'Bookmark Event'}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-orange-burnt' : ''}`} />
                          </button>

                          {isFull ? (
                            <button
                              disabled
                              className="flex-grow py-2.5 bg-white/5 text-white/30 font-display text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-not-allowed border border-white/5"
                            >
                              Sold Out
                            </button>
                          ) : (
                            <Link
                              to={`/register/${event.id}`}
                              className="flex-grow inline-flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-orange-burnt to-[#E06D2B] text-white font-display text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-md active:scale-[0.97] transition-all border border-white/5"
                            >
                              <span>Register Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredEvents.length === 0 && (
                  <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01] flex flex-col items-center p-6">
                    <RefreshCw className="w-10 h-10 text-white/10 mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                    <h3 className="font-display font-bold text-white/60 text-sm">No Events Listed</h3>
                    <p className="text-white/40 text-xs mt-1">Check back later for newly announced updates.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
