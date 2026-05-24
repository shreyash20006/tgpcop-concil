import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, User } from 'lucide-react';
import type { CouncilMember } from '../data/council';

interface CouncilCardProps {
  member: CouncilMember;
}

export const CouncilCard: React.FC<CouncilCardProps> = ({ member }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-panel glow-card rounded-2xl p-6 flex flex-col justify-between border border-white/5 transition-all duration-300 relative bg-[#0F1E42]/10"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Avatar Ring with gold-orange gradient edge */}
        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-burnt font-display font-bold text-lg shadow-xl shrink-0 overflow-hidden relative group-hover:border-orange-burnt/40 transition-colors">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : member.avatarSeed ? (
            <span className="text-white/90">{member.avatarSeed}</span>
          ) : (
            <User className="w-6 h-6 text-white/40" />
          )}
        </div>

        {/* Year Tag */}
        <span className="bg-orange-burnt/10 border border-orange-burnt/25 text-orange-burnt text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {member.year}
        </span>
      </div>

      {/* Roster Information */}
      <div className="mb-4">
        <p className="text-orange-burnt font-display font-extrabold text-[10px] uppercase tracking-widest mb-1.5">
          {member.role}
        </p>
        <h3 className="text-white font-display font-bold text-lg sm:text-xl leading-tight">
          {member.name}
        </h3>
      </div>

      {/* Contact Details */}
      {(member.email || member.phone) && (
        <div className="mt-2 mb-6 space-y-1.5 text-xs text-white/60 font-sans border-t border-white/5 pt-3.5">
          {member.email && (
            <div className="flex items-center space-x-2">
              <span>📧</span>
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center space-x-2">
              <span>📞</span>
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <Link
        to={`/ask?to=${encodeURIComponent(member.name)}`}
        className="mt-auto group flex items-center justify-center space-x-2 w-full py-2.5 bg-white/5 hover:bg-gradient-to-r hover:from-orange-burnt hover:to-[#E06D2B] text-white font-display text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all duration-300 border border-white/5 hover:border-transparent active:scale-98"
      >
        <HelpCircle className="w-4 h-4 text-orange-burnt group-hover:text-white transition-colors" />
        <span>Ask a Question</span>
      </Link>
    </motion.div>
  );
};

export default CouncilCard;
