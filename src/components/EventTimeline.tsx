import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Award, BookOpen, Music, Accessibility } from 'lucide-react';
import { timelineEvents } from '../data/events';

export const EventTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure scroll progress relative to this timeline section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  // Smooth the scroll line drawing
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="w-5 h-5" />;
      case 'cultural':
        return <Music className="w-5 h-5" />;
      case 'sports':
        return <Award className="w-5 h-5" />;
      case 'social':
      default:
        return <Accessibility className="w-5 h-5" />;
    }
  };

  const getBadgeColors = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cultural':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'sports':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'social':
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto px-4 py-16">
      
      {/* 1. Static grey background timeline track */}
      <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 top-4 bottom-4 w-1 bg-navy-dark/10 rounded-full" />

      {/* 2. Dynamic animated foreground timeline track (draws on scroll) */}
      <motion.div
        className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-orange-burnt to-gold-accent origin-top rounded-full z-10"
        style={{ scaleY }}
      />

      <div className="space-y-16">
        {timelineEvents.map((event, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <div
              key={event.id}
              className="relative flex flex-col md:flex-row items-start md:items-center justify-between"
            >
              {/* Central/Left Dot with Active Bubble */}
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ type: 'spring', delay: 0.15 }}
                  className="w-10 h-10 rounded-full bg-navy-dark border-4 border-orange-burnt flex items-center justify-center text-white shadow-lg shadow-orange-burnt/15"
                >
                  {getIcon(event.type)}
                </motion.div>
              </div>

              {/* Layout Alignment Columns */}
              {/* Left Column (Content if Even, Spacer if Odd) */}
              <div className={`w-full md:w-[calc(50%-40px)] pl-16 md:pl-0 ${isEven ? 'md:text-right md:order-1' : 'md:order-3'}`}>
                {isEven && (
                  <TimelineCard event={event} isEven={isEven} getBadgeColors={getBadgeColors} />
                )}
              </div>

              {/* Invisible Spacing center Column */}
              <div className="hidden md:block w-20 md:order-2" />

              {/* Right Column (Content if Odd, Spacer if Even) */}
              <div className={`w-full md:w-[calc(50%-40px)] pl-16 md:pl-0 ${isEven ? 'md:order-3' : 'md:order-1'}`}>
                {!isEven && (
                  <TimelineCard event={event} isEven={isEven} getBadgeColors={getBadgeColors} />
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper card subcomponent to avoid code redundancy
const TimelineCard: React.FC<{
  event: typeof timelineEvents[0];
  isEven: boolean;
  getBadgeColors: (type: string) => string;
}> = ({ event, isEven, getBadgeColors }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white p-6 rounded-xl shadow-md border border-navy-dark/5 hover:shadow-xl transition-shadow relative"
    >
      {/* Category tag */}
      <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-3 ${getBadgeColors(event.type)}`}>
        {event.type}
      </span>

      {/* Date */}
      <div className={`flex items-center space-x-1.5 text-orange-burnt font-semibold text-xs mb-2 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
        <Calendar className="w-3.5 h-3.5" />
        <span>{event.date}</span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-lg sm:text-xl text-navy-dark mb-2 leading-snug">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-navy-dark/80 text-sm leading-relaxed font-sans">
        {event.description}
      </p>
    </motion.div>
  );
};

export default EventTimeline;
