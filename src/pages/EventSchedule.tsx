import React from 'react';
import { CalendarCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ScienceBackground } from '../components/ScienceBackground';
import { EventScheduleSection } from '../components/EventScheduleSection';

export const EventSchedule: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#050B18] overflow-hidden pb-24">
      {/* Background Molecular Animations & Tech Mesh */}
      <ScienceBackground />
      <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      {/* Reusable Header */}
      <PageHeader
        icon={<CalendarCheck className="w-6 h-6 animate-pulse text-orange-burnt" />}
        title="Event Schedule 2026"
        subtitle="Official day-wise program schedule for TGPCOP Induction Programme & Annual Gathering Cultural Week (October 13 – 17, 2026)."
        breadcrumb="Schedule"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        {/* Navigation Breadcrumb Links */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-white/60 hover:text-orange-burnt transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events & Competitions</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Council Notification
            </span>
          </div>
        </div>

        {/* Embedded Full Schedule Section */}
        <EventScheduleSection initialDay={0} showTitle={false} />
      </div>
    </div>
  );
};

export default EventSchedule;
