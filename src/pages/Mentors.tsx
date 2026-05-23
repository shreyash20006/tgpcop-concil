import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Handshake, Loader2, CheckCircle2, GraduationCap, Clock, BookOpen,
  Search, X, User
} from 'lucide-react';

const SPECIALIZATIONS = ['All', 'Pharmacology', 'Pharmaceutics', 'Chemistry', 'Research', 'Placements'];

export const Mentors: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('All');
  const [specFilter, setSpecFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Request modal
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqYear, setReqYear] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('mentors').select('*').eq('is_available', true).order('created_at', { ascending: false });
      setMentors(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = [...mentors];
    if (yearFilter !== 'All') result = result.filter(m => m.year === yearFilter);
    if (specFilter !== 'All') result = result.filter(m => m.specialization.toLowerCase() === specFilter.toLowerCase());
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.specialization.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [mentors, yearFilter, specFilter, searchQuery]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail || !reqYear || !selectedMentor) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('mentor_requests').insert({
        mentor_id: selectedMentor.id,
        junior_name: reqName, junior_email: reqEmail,
        junior_year: reqYear, message: reqMessage,
      });
      if (error) throw error;
      setRequestSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedMentor(null);
    setReqName(''); setReqEmail(''); setReqYear(''); setReqMessage('');
    setRequestSent(false);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-orange-burnt/10 flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-8 h-8 text-orange-burnt" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-navy-dark mb-3">Find Your Mentor</h1>
          <p className="text-navy-dark/60 text-sm sm:text-base font-sans max-w-lg mx-auto">Connect with senior students for academic guidance, career advice, and personal support.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search mentors..."
              className="pl-10 pr-4 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors w-56" />
          </div>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-navy-dark/15 outline-none text-sm font-sans text-navy-dark bg-white">
            <option value="All">All Years</option>
            <option value="B.Pharm III">B.Pharm III</option>
            <option value="B.Pharm IV">B.Pharm IV</option>
            <option value="M.Pharm">M.Pharm</option>
          </select>
          {SPECIALIZATIONS.map(s => (
            <button key={s} onClick={() => setSpecFilter(s)}
              className={`px-3 py-1.5 rounded-full font-display text-xs font-bold transition-all ${specFilter === s ? 'bg-navy-dark text-white' : 'bg-white text-navy-dark/60 border border-navy-dark/10 hover:border-orange-burnt'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Mentor Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 text-orange-burnt animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-dark/10">
            <Handshake className="w-12 h-12 text-navy-dark/15 mx-auto mb-3" />
            <h3 className="font-display font-bold text-navy-dark/60">No mentors found</h3>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(mentor => (
              <motion.div key={mentor.id}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-xl border border-navy-dark/5 shadow-sm p-5 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-navy-dark/5 overflow-hidden mb-4">
                  {mentor.photo_url ? (
                    <img src={mentor.photo_url} alt={mentor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-burnt/10 to-navy-dark/5">
                      <User className="w-8 h-8 text-navy-dark/20" />
                    </div>
                  )}
                </div>
                <h3 className="font-display font-bold text-base text-navy-dark">{mentor.name}</h3>
                <div className="flex items-center space-x-1 text-navy-dark/50 text-xs mb-2">
                  <GraduationCap className="w-3.5 h-3.5" /><span>{mentor.year}</span>
                </div>
                <div className="flex items-center space-x-1 text-orange-burnt text-xs font-semibold mb-1">
                  <BookOpen className="w-3.5 h-3.5" /><span>{mentor.specialization}</span>
                </div>
                {mentor.available_time && (
                  <div className="flex items-center space-x-1 text-navy-dark/40 text-[10px] mb-3">
                    <Clock className="w-3 h-3" /><span>{mentor.available_time}</span>
                  </div>
                )}
                {mentor.bio && <p className="text-xs text-navy-dark/55 font-sans leading-relaxed mb-4 flex-grow">{mentor.bio}</p>}
                <button onClick={() => setSelectedMentor(mentor)}
                  className="w-full py-2 rounded-lg bg-navy-dark hover:bg-orange-burnt text-white font-display text-xs font-bold transition-colors flex items-center justify-center space-x-1.5">
                  <Handshake className="w-3.5 h-3.5" /><span>Connect →</span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div onClick={closeModal} className="absolute inset-0" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-navy-dark/10 overflow-hidden z-10">
              <div className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
                <h4 className="font-display font-extrabold text-sm">Connect with {selectedMentor.name}</h4>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>

              {requestSent ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-display font-extrabold text-lg text-navy-dark mb-2">Request Sent! 🎉</h3>
                  <p className="text-navy-dark/60 text-sm font-sans">Your mentorship request has been sent to <strong>{selectedMentor.name}</strong>.</p>
                </div>
              ) : (
                <form onSubmit={handleConnect} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Your Name *</label>
                    <input type="text" required value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Full name"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Your Email *</label>
                    <input type="email" required value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Your Year *</label>
                    <select required value={reqYear} onChange={e => setReqYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark bg-white transition-colors">
                      <option value="">Select Year</option>
                      <option value="B.Pharm I">B.Pharm I</option>
                      <option value="B.Pharm II">B.Pharm II</option>
                      <option value="B.Pharm III">B.Pharm III</option>
                      <option value="D.Pharm I">D.Pharm I</option>
                      <option value="D.Pharm II">D.Pharm II</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Message</label>
                    <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} rows={3} placeholder="Tell the mentor what you need help with..."
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors resize-none" />
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-navy-dark/15 text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-orange-burnt hover:bg-orange-burnt/90 text-white font-display text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-1.5">
                      {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Sending...</span></> : <span>Send Request →</span>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mentors;
