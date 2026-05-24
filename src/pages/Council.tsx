import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CouncilCard } from '../components/CouncilCard';
import { councilMembers, type CouncilMember } from '../data/council';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Council: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: dbProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_suspended', false);

        if (error) throw error;

        // Map live database profiles by email
        const dbProfilesMap = new Map<string, any>();
        (dbProfiles || []).forEach(p => {
          if (p.email) dbProfilesMap.set(p.email.toLowerCase(), p);
        });

        // Merge live data on top of static council roster
        const merged = councilMembers.map(staticMember => {
          const dbProf = dbProfilesMap.get(staticMember.email.toLowerCase());
          if (dbProf) {
            return {
              ...staticMember,
              name: dbProf.name || staticMember.name,
              year: dbProf.year || staticMember.year,
              avatarUrl: dbProf.avatar_url || undefined,
              phone: dbProf.phone || undefined,
              email: dbProf.email || staticMember.email,
            };
          }
          return staticMember;
        });

        // Dynamically append any new database council profiles not present in the static fallback
        const staticEmails = new Set(councilMembers.map(m => m.email.toLowerCase()));
        (dbProfiles || []).forEach(p => {
          const emailLower = p.email?.toLowerCase();
          if (emailLower && !staticEmails.has(emailLower) && p.name) {
            const displayRole = p.role ? p.role.replace('_', ' ').toUpperCase() : 'COUNCIL MEMBER';
            merged.push({
              role: displayRole,
              name: p.name,
              year: p.year || 'Council Member',
              email: p.email,
              avatarSeed: p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              avatarUrl: p.avatar_url || undefined,
              phone: p.phone || undefined,
            });
          }
        });

        setMembers(merged);
      } catch (err) {
        console.error('Error fetching dynamic council profiles:', err);
        setMembers(councilMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Container Variants for staggering children cards
  const gridContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-12 h-12 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt"
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-burnt text-xs font-bold uppercase tracking-widest block"
          >
            Elected Leadership 2026
          </motion.span>

          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark leading-tight"
            >
              OUR NEWLY SELECTED MEMBERS
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
            className="text-navy-dark/70 text-sm sm:text-base font-sans max-w-xl"
          >
            Representing semesters, cultural programs, physical sports, community NSS campaigns, and student welfare across TGPCOP.
          </motion.p>
        </div>

        {/* 13 Members Grid layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-navy-dark/40">
            <Loader2 className="w-8 h-8 animate-spin text-orange-burnt mb-3" />
            <span className="font-display text-xs sm:text-sm">Retrieving council members live data...</span>
          </div>
        ) : (
          <motion.div
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {members.map((member) => (
              <CouncilCard key={`${member.email}-${member.name}`} member={member} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Council;
