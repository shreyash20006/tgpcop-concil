import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, User } from 'lucide-react';
import type { CouncilMember } from '../data/council';

interface CouncilCardProps {
  member: CouncilMember;
}

export const CouncilCard: React.FC<CouncilCardProps> = ({ member }) => {
  // Animation variants
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
      whileHover={{ y: -6, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(200, 75, 14, 0.1), 0 10px 10px -5px rgba(200, 75, 14, 0.04)' }}
      className="bg-white border-l-4 border-orange-burnt rounded-r-xl shadow-md p-6 flex flex-col justify-between transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Avatar Ring */}
        <div className="w-14 h-14 rounded-full bg-orange-burnt/10 border border-orange-burnt/20 flex items-center justify-center text-orange-burnt font-display font-bold text-lg shadow-inner shrink-0 overflow-hidden relative">
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
            <span>{member.avatarSeed}</span>
          ) : (
            <User className="w-6 h-6" />
          )}
        </div>

        {/* Year Tag */}
        <span className="bg-navy-dark/5 text-navy-dark text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {member.year}
        </span>
      </div>

      {/* Roster Information */}
      <div className="mb-4">
        <p className="text-orange-burnt font-display font-bold text-xs uppercase tracking-widest mb-1.5">
          {member.role}
        </p>
        <h3 className="text-navy-dark font-display font-bold text-lg sm:text-xl leading-tight">
          {member.name}
        </h3>
      </div>

      {/* Contact Details */}
      {(member.email || member.phone) && (
        <div className="mt-2 mb-4 space-y-1 text-[11px] text-navy-dark/65 font-sans border-t border-navy-dark/5 pt-2">
          {member.email && (
            <div className="flex items-center space-x-1.5">
              <span>📧</span>
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center space-x-1.5">
              <span>📞</span>
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <Link
        to={`/ask?to=${encodeURIComponent(member.name)}`}
        className="mt-auto group flex items-center justify-center space-x-2 w-full py-2.5 bg-navy-dark hover:bg-orange-burnt text-white font-display text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-all duration-300"
      >
        <HelpCircle className="w-4 h-4 text-orange-burnt group-hover:text-white transition-colors" />
        <span>Ask a Question</span>
      </Link>
    </motion.div>
  );
};

export default CouncilCard;
