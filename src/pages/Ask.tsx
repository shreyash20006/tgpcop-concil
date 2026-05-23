import React from 'react';
import { motion } from 'framer-motion';
import { AskForm } from '../components/AskForm';
import { HelpCircle } from 'lucide-react';

export const Ask: React.FC = () => {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-light">
      {/* Page Title Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-12 h-12 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt mx-auto"
          >
            <HelpCircle className="w-6 h-6" />
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-burnt text-xs font-bold uppercase tracking-widest block"
          >
            Student Grievance & Q&A
          </motion.span>

          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark leading-tight"
            >
              ASK THE COUNCIL
            </motion.h1>
            
            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="h-1 bg-orange-burnt mx-auto mt-4 rounded-full"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-navy-dark/70 text-sm sm:text-base font-sans"
          >
            Have a question about mid-sems, sports registrations, anti-ragging compliance, or general college life? Send us a message directly.
          </motion.p>
        </div>
      </div>

      {/* Dynamic Form and FAQs Accordion */}
      <AskForm />
    </div>
  );
};

export default Ask;
