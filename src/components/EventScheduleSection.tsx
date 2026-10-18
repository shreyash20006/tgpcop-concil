import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, MapPin, Phone, Users, UserCheck, Search,
  Download, Sparkles, Filter, Check, Share2,
  Trophy, Music, Film, Gamepad2, BookOpen
} from 'lucide-react';
import { eventScheduleDays, type ScheduleDay } from '../data/events';
import { downloadICS } from '../utils/ics';

interface EventScheduleSectionProps {
  initialDay?: number;
  showTitle?: boolean;
}

export const EventScheduleSection: React.FC<EventScheduleSectionProps> = ({
  initialDay = 0, // 0 = all days, 1-5 = specific day
  showTitle = true,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleDownloadDayCalendar = (day: ScheduleDay) => {
    const eventsList = day.events.map(e => `• ${e.time}: ${e.name} (${e.venue})`).join('\n');
    const coordinatorsList = day.studentCoordinators.map(c => `${c.name} (${c.phone || ''})`).join(', ');
    const desc = `${day.title}\n\nSchedule:\n${eventsList}\n\nStudent Coordinators: ${coordinatorsList}`;
    downloadICS(
      `TGPCOP Day ${day.srNo}: ${day.title}`,
      desc,
      `${day.dateIso}T10:00:00`,
      day.events[0]?.venue || 'TGPCOP Campus'
    );
  };

  const filteredDays = useMemo(() => {
    let days = selectedDay === 0
      ? eventScheduleDays
      : eventScheduleDays.filter(d => d.srNo === selectedDay);

    if (!searchQuery.trim()) return days;

    const query = searchQuery.toLowerCase().trim();
    return days.map(day => {
      const matchDay =
        day.dayOfWeek.toLowerCase().includes(query) ||
        day.date.includes(query) ||
        day.title.toLowerCase().includes(query) ||
        day.studentCoordinators.some(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));

      const matchedEvents = day.events.filter(e =>
        matchDay ||
        e.name.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.time.toLowerCase().includes(query) ||
        (e.notes && e.notes.toLowerCase().includes(query))
      );

      if (matchDay || matchedEvents.length > 0) {
        return {
          ...day,
          events: matchDay && matchedEvents.length === 0 ? day.events : matchedEvents
        };
      }
      return null;
    }).filter(Boolean) as ScheduleDay[];
  }, [selectedDay, searchQuery]);

  const getEventCategoryIcon = (category?: string, name?: string) => {
    const text = `${category} ${name}`.toLowerCase();
    if (text.includes('garba') || text.includes('dance') || text.includes('singing') || text.includes('music')) {
      return <Music className="w-4 h-4 text-pink-400" />;
    }
    if (text.includes('quiz') || text.includes('scitoons') || text.includes('inauguration') || text.includes('induction')) {
      return <BookOpen className="w-4 h-4 text-cyan-400" />;
    }
    if (text.includes('movie') || text.includes('drama') || text.includes('reel') || text.includes('ramp')) {
      return <Film className="w-4 h-4 text-purple-400" />;
    }
    if (text.includes('esport') || text.includes('bgmi') || text.includes('free fire') || text.includes('treasure')) {
      return <Gamepad2 className="w-4 h-4 text-amber-400" />;
    }
    if (text.includes('prize') || text.includes('closing')) {
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    }
    return <Sparkles className="w-4 h-4 text-orange-burnt" />;
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      {showTitle && (
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-burnt/10 border border-orange-burnt/25 text-orange-burnt font-mono text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Official Event Schedule • 13th to 17th October 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            5-Day Induction & Cultural Week Timetable
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-sans max-w-2xl mx-auto mt-2">
            Comprehensive itinerary of technical inaugurations, intellectual symposiums, cultural nights, traditional Garba, and e-sports championships.
          </p>
        </div>
      )}

      {/* Control Bar: Day Tabs, Search, View Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-[#0F1E42]/60 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl">
        
        {/* Day selection pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold tracking-wide whitespace-nowrap transition-all duration-200 ${
              selectedDay === 0
                ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/30'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            All 5 Days
          </button>
          {eventScheduleDays.map((d) => (
            <button
              key={d.srNo}
              onClick={() => setSelectedDay(d.srNo)}
              className={`px-3 py-2 rounded-xl text-xs font-display font-bold tracking-wide whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                selectedDay === d.srNo
                  ? 'bg-orange-burnt text-white shadow-lg shadow-orange-burnt/30'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Day {d.srNo}</span>
              <span className="text-[10px] opacity-75 font-mono">({d.date.slice(0, 5)})</span>
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, venue, coordinator..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-burnt/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-orange-burnt text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Official Table View"
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-orange-burnt text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredDays.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl p-6 max-w-md mx-auto">
          <Filter className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-white font-display font-bold text-base">No Matching Events Found</h3>
          <p className="text-white/50 text-xs mt-1">Try adjusting your search query or select another day.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDay(0); }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-burnt/20 border border-orange-burnt/40 text-orange-burnt text-xs font-bold hover:bg-orange-burnt hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="space-y-8">
          {filteredDays.map((day) => (
            <div
              key={day.srNo}
              className="bg-[#0B1530]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-orange-burnt/40"
            >
              {/* Day Header Ribbon */}
              <div className="bg-gradient-to-r from-[#0F1E42] via-[#14234C] to-[#0F1E42] px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-burnt/15 border border-orange-burnt/30 flex flex-col items-center justify-center text-orange-burnt font-mono shrink-0 shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">DAY</span>
                    <span className="text-xl font-extrabold leading-none mt-0.5">{day.srNo}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-base sm:text-lg text-white">
                        {day.dayOfWeek}
                      </span>
                      <span className="text-xs font-mono text-orange-burnt font-bold bg-orange-burnt/10 border border-orange-burnt/20 px-2 py-0.5 rounded-md">
                        {day.date}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 font-sans mt-0.5 line-clamp-1">
                      {day.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDayCalendar(day)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 text-xs font-display font-semibold transition-colors"
                    title="Add Day Schedule to Calendar"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-burnt" />
                    <span className="hidden sm:inline">Add to Calendar</span>
                  </button>
                </div>
              </div>

              {/* Day Content Body */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Events Column (Spans 2 columns) */}
                <div className="lg:col-span-2 space-y-3.5">
                  <h4 className="text-xs font-display font-extrabold uppercase tracking-wider text-orange-burnt flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled Events & Timeline</span>
                  </h4>

                  {day.events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#080F25]/90 border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all duration-200 group"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            {getEventCategoryIcon(event.category, event.name)}
                          </div>
                          <div>
                            <span className="font-display font-bold text-sm text-white group-hover:text-orange-burnt transition-colors block leading-snug">
                              {event.name}
                            </span>
                            {event.notes && (
                              <p className="text-[11px] text-white/60 font-sans mt-1 leading-relaxed">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {event.highlight && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-orange-burnt/15 border border-orange-burnt/30 text-orange-burnt shrink-0">
                            Key Event
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/70 pt-2 border-t border-white/5 mt-3">
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <Clock className="w-3.5 h-3.5 text-orange-burnt" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-cyan-300">
                          <MapPin className="w-3.5 h-3.5 text-orange-burnt" />
                          <span className="uppercase">{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coordinators Sidebar */}
                <div className="bg-[#080F25]/70 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    {/* Student Coordinators */}
                    <div className="mb-5">
                      <h4 className="text-xs font-display font-extrabold uppercase tracking-wider text-orange-burnt flex items-center gap-1.5 mb-3">
                        <Users className="w-3.5 h-3.5" />
                        <span>Student Coordinators</span>
                      </h4>

                      <div className="space-y-2.5">
                        {day.studentCoordinators.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-display font-bold text-white truncate">
                                {c.name}
                              </p>
                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  className="text-[11px] font-mono text-white/60 hover:text-orange-burnt transition-colors flex items-center gap-1 mt-0.5"
                                >
                                  <Phone className="w-3 h-3 text-orange-burnt" />
                                  <span>{c.phone}</span>
                                </a>
                              )}
                            </div>

                            {c.phone && (
                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`tel:${c.phone}`}
                                  title="Call Coordinator"
                                  className="p-1.5 rounded-lg bg-orange-burnt/10 hover:bg-orange-burnt text-orange-burnt hover:text-white transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={(e) => handleCopyPhone(c.phone!, e)}
                                  title="Copy Number"
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                  {copiedPhone === c.phone ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Share2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Faculty Coordinators */}
                    <div>
                      <h4 className="text-xs font-display font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Faculty Coordinators</span>
                      </h4>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <p className="text-xs font-display font-semibold text-white/90">
                          TGPCOP Faculty Advisory
                        </p>
                        <p className="text-[10px] text-white/50 font-sans mt-0.5">
                          Student Council Faculty In-Charge & Department Guides
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Help tip */}
                  <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-white/40 font-sans">
                    Reach out to coordinators for slot registrations and stage requirements.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= OFFICIAL TABLE VIEW ================= */
        <div className="bg-[#0B1530]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1E42] via-[#14234C] to-[#0F1E42] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-extrabold text-white text-base sm:text-lg">
                Official Event Schedule Table
              </h3>
              <p className="text-xs text-white/60 font-sans mt-0.5">
                Complete timetable matching the official university council notification.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white text-xs font-display font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-orange-burnt" />
              <span>Print / Export</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] font-display font-extrabold uppercase tracking-wider text-orange-burnt">
                  <th className="py-3.5 px-4 font-mono w-16 text-center">Sr No</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Day & Date</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Events</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Time</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Venue</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Student Coordinators</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Faculty Coordinators</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredDays.map((day) => (
                  <tr
                    key={day.srNo}
                    className="hover:bg-white/[0.02] transition-colors align-top"
                  >
                    {/* Sr No */}
                    <td className="py-4 px-4 font-mono font-bold text-center text-white/90">
                      <span className="w-7 h-7 rounded-lg bg-orange-burnt/10 border border-orange-burnt/20 inline-flex items-center justify-center text-orange-burnt">
                        {day.srNo}
                      </span>
                    </td>

                    {/* Day & Date */}
                    <td className="py-4 px-4">
                      <div className="font-display font-extrabold text-white text-sm">
                        {day.dayOfWeek}
                      </div>
                      <div className="font-mono text-orange-burnt font-semibold text-xs mt-0.5">
                        {day.date}
                      </div>
                    </td>

                    {/* Events */}
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        {day.events.map((ev) => (
                          <div key={ev.id} className="border-l-2 border-orange-burnt/40 pl-2.5">
                            <span className="font-display font-bold text-white text-xs block">
                              {ev.name}
                            </span>
                            {ev.notes && (
                              <span className="text-[10px] text-white/50 block font-sans">
                                {ev.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-4 font-mono text-amber-300">
                      <div className="space-y-2">
                        {day.events.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-1.5 py-0.5">
                            <Clock className="w-3 h-3 text-orange-burnt shrink-0" />
                            <span>{ev.time}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Venue */}
                    <td className="py-4 px-4 text-cyan-300 font-mono">
                      <div className="space-y-2">
                        {day.events.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-1.5 py-0.5">
                            <MapPin className="w-3 h-3 text-orange-burnt shrink-0" />
                            <span className="uppercase text-[11px]">{ev.venue}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Student Coordinators */}
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        {day.studentCoordinators.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.03]">
                            <div>
                              <span className="font-display font-bold text-white block text-xs">
                                {c.name}
                              </span>
                              {c.phone && (
                                <a
                                  href={`tel:${c.phone}`}
                                  className="font-mono text-[11px] text-orange-burnt hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>[{c.phone}]</span>
                                </a>
                              )}
                            </div>
                            {c.phone && (
                              <button
                                onClick={(e) => handleCopyPhone(c.phone!, e)}
                                title="Copy Phone Number"
                                className="p-1 text-white/40 hover:text-white"
                              >
                                {copiedPhone === c.phone ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Share2 className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Faculty Coordinators */}
                    <td className="py-4 px-4 text-white/70">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="font-display font-bold text-xs text-white block">
                          Council Faculty Advisory
                        </span>
                        <span className="text-[10px] text-white/50 block mt-0.5">
                          TGPCOP Central Faculty Committee
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
