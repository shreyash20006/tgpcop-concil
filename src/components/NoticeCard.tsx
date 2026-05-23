import React from 'react';
import { motion } from 'framer-motion';
import { Pin, ArrowUpRight, Download, Calendar } from 'lucide-react';
import type { Notice } from '../data/notices';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  // Category-specific styles
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Academic':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Event':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Alert':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'General':
      default:
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  const isDownload = notice.linkText?.toLowerCase().includes('download') || notice.linkText?.toLowerCase().includes('pdf');

  return (
    <motion.div
      layout // Framer Motion layout transition on list filter rearranging!
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-xl shadow-sm border border-navy-dark/5 p-6 relative flex flex-col justify-between"
    >
      <div>
        {/* Header Badging & Pin */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1.5 text-orange-burnt">
            <Pin className="w-5 h-5 fill-current transform -rotate-45" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-dark/40">Pinned Notice</span>
          </div>
          
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryStyles(notice.category)}`}>
            {notice.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg sm:text-xl text-navy-dark mb-2 leading-snug">
          {notice.title}
        </h3>

        {/* Date Row */}
        <div className="flex items-center space-x-1.5 text-navy-dark/50 text-xs mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{notice.date}</span>
        </div>

        {/* Description Body */}
        <p className="text-navy-dark/85 text-sm sm:text-base leading-relaxed mb-6 font-sans">
          {notice.description}
        </p>
      </div>

      {/* Conditional Action Button */}
      {notice.linkText && (
        <a
          href={notice.linkUrl || '#'}
          target="_blank"
          rel="noreferrer"
          className={`group flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg font-display text-sm font-semibold transition-all duration-300 ${
            notice.category === 'Alert'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/15'
              : 'bg-navy-dark hover:bg-orange-burnt text-white shadow-md shadow-navy-dark/10'
          }`}
        >
          <span>{notice.linkText}</span>
          {isDownload ? (
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          ) : (
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          )}
        </a>
      )}
    </motion.div>
  );
};

export default NoticeCard;
