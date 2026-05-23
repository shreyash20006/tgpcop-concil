import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Newspaper, Loader2, Download, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('newsletters')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setNewsletters(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-orange-burnt/10 flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-7 h-7 text-orange-burnt" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy-dark mb-3">Council Newsletter</h1>
          <p className="text-navy-dark/60 text-sm sm:text-base font-sans max-w-lg mx-auto">Monthly updates, event recaps, and highlights from the Student Council.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 text-orange-burnt animate-spin" /></div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-dark/10">
            <Newspaper className="w-12 h-12 text-navy-dark/15 mx-auto mb-3" />
            <h3 className="font-display font-bold text-navy-dark/60">No Newsletters Published Yet</h3>
            <p className="text-navy-dark/40 text-sm font-sans">The first edition is on its way!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsletters.map((nl, i) => {
              const sections: { heading: string; content: string }[] = typeof nl.sections === 'string' ? JSON.parse(nl.sections) : (nl.sections || []);
              const isExpanded = expandedId === nl.id;

              return (
                <motion.div key={nl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-navy-dark/10 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 text-navy-dark/40 text-xs mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /><span>{nl.month}</span>
                        </div>
                        <h3 className="font-display font-extrabold text-lg text-navy-dark">{nl.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {nl.pdf_url && (
                          <a href={nl.pdf_url} download target="_blank" rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-orange-burnt text-white text-xs font-bold hover:bg-orange-burnt/90 transition-colors">
                            <Download className="w-3.5 h-3.5" /><span>PDF</span>
                          </a>
                        )}
                        <button onClick={() => setExpandedId(isExpanded ? null : nl.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-navy-dark/5 text-navy-dark text-xs font-bold hover:bg-navy-dark/10 transition-colors">
                          {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /><span>Close</span></> : <><ChevronDown className="w-3.5 h-3.5" /><span>Read</span></>}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && sections.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-2 space-y-5 border-t border-navy-dark/5">
                          {sections.map((sec, j) => (
                            <div key={j}>
                              <h4 className="font-display font-bold text-sm text-orange-burnt mb-2">{sec.heading}</h4>
                              <p className="text-navy-dark/70 text-sm font-sans leading-relaxed whitespace-pre-wrap">{sec.content}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
