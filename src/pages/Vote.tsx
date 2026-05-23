import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Vote as VoteIcon, Loader2, CheckCircle2, AlertTriangle, Mail, Clock } from 'lucide-react';

export const Vote: React.FC = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setPolls(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="pt-28 pb-24 min-h-screen bg-gray-light flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-burnt animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-orange-burnt/10 flex items-center justify-center mx-auto mb-4">
            <VoteIcon className="w-7 h-7 text-orange-burnt" />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy-dark mb-3">Active Polls</h1>
          <p className="text-navy-dark/60 text-sm sm:text-base font-sans max-w-lg mx-auto">Cast your vote and make your voice heard. Results are shown live after voting.</p>
        </motion.div>

        {polls.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-dark/10 shadow-sm">
            <VoteIcon className="w-12 h-12 text-navy-dark/15 mx-auto mb-3" />
            <h3 className="font-display font-bold text-navy-dark/60 mb-1">No Active Polls</h3>
            <p className="text-navy-dark/40 text-sm font-sans">Check back later for new voting opportunities.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll, i) => (
              <motion.div key={poll.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PollCard: React.FC<{ poll: any }> = ({ poll }) => {
  const options: string[] = typeof poll.options === 'string' ? JSON.parse(poll.options) : (poll.options || []);
  const [selected, setSelected] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchResults = async () => {
    const { data } = await supabase
      .from('votes')
      .select('selected_option')
      .eq('poll_id', poll.id);
    const counts: Record<string, number> = {};
    options.forEach(o => { counts[o] = 0; });
    (data || []).forEach(v => { counts[v.selected_option] = (counts[v.selected_option] || 0) + 1; });
    setResults(counts);
    setTotalVotes((data || []).length);
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !voterEmail) return;
    setError('');
    setIsSubmitting(true);

    try {
      // Check duplicate
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('email', voterEmail)
        .maybeSingle();
      if (existing) {
        setError('You have already voted in this poll!');
        await fetchResults();
        setHasVoted(true);
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('votes').insert({
        poll_id: poll.id, email: voterEmail, selected_option: selected,
      });
      if (insertError) throw insertError;

      await fetchResults();
      setHasVoted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to cast vote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = poll.end_date && new Date(poll.end_date) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-navy-dark/10 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <h3 className="font-display font-extrabold text-lg text-navy-dark flex items-center space-x-2">
            <VoteIcon className="w-5 h-5 text-orange-burnt" />
            <span>{poll.title}</span>
          </h3>
          {poll.end_date && (
            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isExpired ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              <Clock className="w-3 h-3" />
              <span>{isExpired ? 'Ended' : `Ends: ${new Date(poll.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}</span>
            </span>
          )}
        </div>
        {poll.description && <p className="text-navy-dark/60 text-sm font-sans mb-5">{poll.description}</p>}

        <AnimatePresence mode="wait">
          {!hasVoted ? (
            <motion.form key="form" onSubmit={handleVote} exit={{ opacity: 0 }} className="space-y-4">
              {error && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                {options.map(opt => (
                  <label key={opt}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${selected === opt ? 'border-orange-burnt bg-orange-burnt/5' : 'border-navy-dark/10 hover:border-navy-dark/20'}`}>
                    <input type="radio" name={`poll-${poll.id}`} value={opt} checked={selected === opt}
                      onChange={() => setSelected(opt)} className="accent-orange-burnt w-4 h-4" />
                    <span className="text-sm font-sans text-navy-dark font-medium">{opt}</span>
                  </label>
                ))}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
                <input type="email" required value={voterEmail} onChange={e => setVoterEmail(e.target.value)} placeholder="Your email (for duplicate check)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors" />
              </div>
              <button type="submit" disabled={isSubmitting || !selected || isExpired}
                className="w-full py-2.5 rounded-lg bg-orange-burnt hover:bg-orange-burnt/90 text-white font-display text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Casting Vote...</span></> : <><VoteIcon className="w-4 h-4" /><span>Cast Vote →</span></>}
              </button>
            </motion.form>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-600 font-display font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{error ? error : 'Vote Cast Successfully!'}</span>
              </div>
              <div className="space-y-3">
                {options.map(opt => {
                  const count = results[opt] || 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  return (
                    <div key={opt} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-sans font-medium ${selected === opt ? 'text-orange-burnt font-bold' : 'text-navy-dark'}`}>{opt}</span>
                        <span className="text-navy-dark/50 text-xs font-mono">{pct}% ({count})</span>
                      </div>
                      <div className="w-full h-3 bg-navy-dark/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${selected === opt ? 'bg-orange-burnt' : 'bg-navy-dark/20'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-navy-dark/40 text-xs font-mono text-right">Total votes: {totalVotes}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Vote;
