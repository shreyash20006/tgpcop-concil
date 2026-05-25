import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle, breadcrumb }) => {
  return (
    <div className="relative w-full h-[210px] md:h-[280px] bg-[#0D1B3E] overflow-hidden flex items-center z-10 border-b border-white/5 pt-10 sm:pt-14 md:pt-16">
      {/* Decorative molecular vectors at background (opacity 0.06) */}
      <div className="absolute right-6 sm:right-16 top-6 sm:top-10 opacity-[0.06] text-orange-burnt select-none pointer-events-none">
        <svg width="220" height="220" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" />
          <polygon points="75,30 100,15 125,30 125,60 100,75 75,60" />
          <line x1="50" y1="75" x2="50" y2="95" />
          <circle cx="50" cy="15" r="3.5" fill="currentColor" />
          <circle cx="75" cy="30" r="3.5" fill="currentColor" />
          <circle cx="25" cy="30" r="3.5" fill="currentColor" />
          <circle cx="50" cy="75" r="3.5" fill="currentColor" />
          <circle cx="100" cy="75" r="3.5" fill="currentColor" />
        </svg>
      </div>

      <div className="absolute left-6 sm:left-14 bottom-10 opacity-[0.05] text-gold-accent select-none pointer-events-none hidden md:block">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="30" cy="30" r="10" />
          <circle cx="70" cy="30" r="14" />
          <circle cx="50" cy="70" r="8" />
          <line x1="40" y1="30" x2="56" y2="30" />
          <line x1="37" y1="37" x2="45" y2="63" />
          <line x1="63" y1="37" x2="55" y2="63" />
        </svg>
      </div>

      {/* Outer Glow Orb */}
      <div className="absolute bottom-0 right-1/3 w-[350px] h-[150px] bg-orange-burnt/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Inner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center h-full relative z-10">
        
        {/* Breadcrumb Path */}
        <div className="mb-3.5 sm:mb-4 flex items-center space-x-2 text-xs font-display font-bold uppercase tracking-wider text-orange-burnt">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="opacity-40">/</span>
          <span className="text-white/60 font-semibold">{breadcrumb || title}</span>
        </div>

        {/* Title & Icon Header row */}
        <div className="flex items-center space-x-3.5 sm:space-x-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-burnt/10 flex items-center justify-center text-orange-burnt border border-orange-burnt/25 shadow-xl shrink-0">
            {icon}
          </div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white leading-tight uppercase tracking-wide"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <p className="text-white/60 text-xs sm:text-sm font-sans mt-1 sm:mt-1.5 max-w-xl truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* bottom 2px Orange Gradient bar strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-burnt via-gold-accent to-orange-burnt shadow-[0_0_10px_rgba(200,75,14,0.4)]" />
    </div>
  );
};

export default PageHeader;
