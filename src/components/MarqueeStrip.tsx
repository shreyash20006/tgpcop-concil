import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { notices } from '../data/notices';
import { AlertCircle } from 'lucide-react';

export const MarqueeStrip: React.FC = () => {
  // Combine notices into a single text strip, duplicate it to ensure a seamless infinite scroll loop
  const marqueeItems = notices.map((n) => ({
    text: `⚡ [${n.category.toUpperCase()}] ${n.title}`,
    id: n.id,
  }));

  // Duplicate items to prevent gaps during animation
  const duplicatedItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="bg-navy-dark py-3.5 border-y border-orange-burnt/30 overflow-hidden w-full flex items-center relative z-20 shadow-md">
      {/* Fixed Tag Label */}
      <div className="absolute left-0 top-0 bottom-0 bg-orange-burnt text-white font-display font-bold text-xs uppercase tracking-wider px-4 flex items-center z-30 shadow-lg shrink-0">
        <AlertCircle className="w-4 h-4 mr-1.5 animate-pulse" />
        Latest Updates
      </div>

      {/* Infinite Ticker Track */}
      <motion.div
        className="flex whitespace-nowrap pl-40 gap-16"
        animate={{ x: [0, -1000] }}
        transition={{
          ease: 'linear',
          duration: 35,
          repeat: Infinity,
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <Link
            key={`${item.id}-${idx}`}
            to="/notices"
            className="inline-flex items-center text-orange-burnt font-display font-semibold text-xs sm:text-sm tracking-wide hover:text-gold-accent transition-colors"
          >
            <span className="mr-2 text-gold-accent">✦</span>
            {item.text}
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default MarqueeStrip;
