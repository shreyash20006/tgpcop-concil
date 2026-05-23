import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Users, Hourglass, ArrowRight } from 'lucide-react';

interface CompetitionCardProps {
  competition: any;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const seatsLeft = (competition.capacity || 100) - (competition.registered_count || 0);
  const isFull = seatsLeft <= 0;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(`${competition.deadline || competition.date}T23:59:59`) - +new Date();
      let newTimeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false,
        };
      }

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [competition.deadline, competition.date]);

  // Card Variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)' }}
      className="bg-white rounded-xl shadow-md border border-navy-dark/5 overflow-hidden flex flex-col justify-between"
    >
      {/* Upper Color Strip */}
      <div className="bg-gradient-to-r from-orange-burnt to-gold-accent h-2 w-full" />

      <div className="p-6 flex flex-col h-full justify-between">
        <div>
          {/* Header Trophy Badging */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt shrink-0">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col items-end space-y-1">
              {timeLeft.isExpired ? (
                <span className="bg-red-50 text-red-600 border border-red-150 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Ended
                </span>
              ) : (
                <span className="bg-orange-burnt/10 text-orange-burnt border border-orange-burnt/25 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center">
                  <Hourglass className="w-3.5 h-3.5 mr-1 animate-spin" style={{ animationDuration: '4s' }} />
                  Active
                </span>
              )}
              <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                {isFull ? '🔴 Full' : `🟢 ${seatsLeft} seats left`}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-xl text-navy-dark mb-3 leading-snug">
            {competition.title}
          </h3>

          {/* Description */}
          <p className="text-navy-dark/80 text-sm leading-relaxed mb-6 font-sans">
            {competition.description}
          </p>

          {/* Prize Info & Eligibility Grid */}
          <div className="space-y-3 mb-6 bg-navy-dark/5 p-4 rounded-lg">
            <div className="flex items-start space-x-2 text-xs">
              <Trophy className="w-4 h-4 text-orange-burnt shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-dark block">Rewards:</span>
                <span className="text-navy-dark/80">{competition.prizeInfo || 'Exciting Prizes & Certificates'}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-xs">
              <Users className="w-4 h-4 text-orange-burnt shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy-dark block">Eligibility:</span>
                <span className="text-navy-dark/80">{competition.participationInfo || 'All B.Pharm & D.Pharm Students'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Countdown Timer Drawer */}
        <div>
          {!timeLeft.isExpired && (
            <div className="grid grid-cols-4 gap-2 mb-6 text-center">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds },
              ].map((cell, idx) => (
                <div key={idx} className="bg-navy-dark text-white rounded p-2">
                  <span className="block font-display font-bold text-base sm:text-lg leading-none mb-1">
                    {String(cell.value).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase tracking-wider opacity-75">
                    {cell.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Participate CTA Button */}
          {timeLeft.isExpired || isFull ? (
            <button
              disabled
              className="w-full py-3 bg-navy-dark/10 text-navy-dark/40 font-display font-semibold rounded-lg text-sm cursor-not-allowed uppercase"
            >
              {isFull && !timeLeft.isExpired ? 'Registrations Full' : 'Registrations Closed'}
            </button>
          ) : (
            <Link
              to={`/register/${competition.id}`}
              className="group flex items-center justify-center space-x-2 w-full py-3 bg-orange-burnt hover:bg-orange-burnt/90 text-white font-display font-bold rounded-lg text-sm shadow-md hover:shadow-orange-burnt/20 hover:-translate-y-[1px] transition-all duration-300"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CompetitionCard;
