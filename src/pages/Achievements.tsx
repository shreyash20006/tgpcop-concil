import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Trophy, Loader2, GraduationCap } from 'lucide-react';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Research', 'Competition'];

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-blue-50 text-blue-600 border-blue-200',
  sports: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  cultural: 'bg-purple-50 text-purple-600 border-purple-200',
  research: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  competition: 'bg-amber-50 text-amber-600 border-amber-200',
};

export const Achievements: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
      setItems(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') setFiltered(items);
    else setFiltered(items.filter(a => a.category.toLowerCase() === activeCategory.toLowerCase()));
  }, [items, activeCategory]);

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-orange-burnt/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-orange-burnt" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark mb-3">Hall of Fame</h1>
          <p className="text-navy-dark/60 text-sm sm:text-base font-sans max-w-lg mx-auto">Celebrating TGPCOP's finest students and their outstanding achievements.</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-display text-xs font-bold tracking-wide transition-all ${activeCategory === cat ? 'bg-navy-dark text-white shadow-md' : 'bg-white text-navy-dark/60 border border-navy-dark/10 hover:border-orange-burnt hover:text-orange-burnt'}`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 text-orange-burnt animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-dark/10">
            <Trophy className="w-12 h-12 text-navy-dark/15 mx-auto mb-3" />
            <h3 className="font-display font-bold text-navy-dark/60">No achievements found</h3>
            <p className="text-navy-dark/40 text-sm font-sans">Check back later for new entries.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map(item => (
              <motion.div key={item.id}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-xl border border-navy-dark/5 shadow-sm overflow-hidden flex flex-col"
              >
                {item.image_url ? (
                  <div className="h-44 bg-navy-dark/5 overflow-hidden">
                    <img src={item.image_url} alt={item.student_name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-navy-dark/5 to-orange-burnt/5 flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-orange-burnt/30" />
                  </div>
                )}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category?.toLowerCase()] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-navy-dark mb-1">{item.student_name}</h3>
                  <div className="flex items-center space-x-1 text-navy-dark/50 text-xs mb-2">
                    <GraduationCap className="w-3.5 h-3.5" /><span>{item.year}</span>
                  </div>
                  <p className="text-sm font-display font-semibold text-orange-burnt mb-1">{item.title}</p>
                  {item.description && <p className="text-xs text-navy-dark/55 font-sans leading-relaxed flex-grow">{item.description}</p>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
