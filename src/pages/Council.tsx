import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CouncilCard } from '../components/CouncilCard';
import { councilMembers, type CouncilMember } from '../data/council';
import { ShieldCheck } from 'lucide-react';
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

  const gridContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#050B18] pt-32 pb-24 overflow-hidden">
      {/* Background orbs and grid noise */}
      <div className="absolute top-[20%] left-[5%] w-[450px] h-[450px] rounded-full ambient-orb-orange z-0 pointer-events-none" />
      <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] rounded-full ambient-orb-gold z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-12 h-12 rounded-xl bg-orange-burnt/10 flex items-center justify-center text-orange-burnt border border-orange-burnt/20 shadow-lg"
          >
            <ShieldCheck className="w-6 h-6" />
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-orange-burnt text-xs font-bold uppercase tracking-widest block"
          >
            Elected Student Leadership
          </motion.span>

          <div className="relative inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight uppercase"
            >
              Our Council Members
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="h-1 bg-gradient-to-r from-orange-burnt to-gold-accent mx-auto mt-4 rounded-full"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm sm:text-base font-sans"
          >
            Representing semesters, cultural programs, physical sports, community NSS campaigns, and student welfare across TGPCOP.
          </motion.p>
        </div>

        {/* Shimmer Skeleton Loaders */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-white/5 h-64 overflow-hidden relative"
              >
                <div className="absolute inset-0 shimmer pointer-events-none" />
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10" />
                  <div className="w-20 h-5 bg-white/5 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-white/5 rounded" />
                  <div className="w-40 h-6 bg-white/5 rounded" />
                </div>
                <div className="w-full h-10 bg-white/5 rounded-xl mt-6" />
              </div>
            ))}
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
