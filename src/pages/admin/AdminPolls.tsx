import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/admin/Toast';
import { logActivity } from '../../lib/logs';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { Vote, Plus, Loader2, Trash2, X, Edit, Power } from 'lucide-react';

export const AdminPolls: React.FC = () => {
  const toast = useToast();
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(msg);
    else toast.error(msg);
  };
  const { email } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Create/Edit form
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Vote results
  const [pollResults, setPollResults] = useState<Record<string, Record<string, number>>>({});

  const fetchPolls = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
    setPolls(data || []);

    // Fetch vote counts for each poll
    const results: Record<string, Record<string, number>> = {};
    for (const p of (data || [])) {
      const { data: votes } = await supabase.from('votes').select('selected_option').eq('poll_id', p.id);
      const counts: Record<string, number> = {};
      const opts: string[] = typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || []);
      opts.forEach(o => { counts[o] = 0; });
      (votes || []).forEach(v => { counts[v.selected_option] = (counts[v.selected_option] || 0) + 1; });
      results[p.id] = counts;
    }
    setPollResults(results);
    setIsLoading(false);
  };

  useEffect(() => { fetchPolls(); }, []);

  const openCreate = () => {
    setEditId(null); setTitle(''); setDescription(''); setOptions(['', '']); setEndDate(''); setIsActive(true);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditId(p.id); setTitle(p.title); setDescription(p.description || '');
    setOptions(typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || ['', '']));
    setEndDate(p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '');
    setIsActive(p.is_active);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validOptions = options.filter(o => o.trim());
    if (!title || validOptions.length < 2) { showToast('Title and at least 2 options required', 'error'); return; }
    setIsSaving(true);
    try {
      const payload = { title, description, options: validOptions, end_date: endDate || null, is_active: isActive };
      if (editId) {
        const { error } = await supabase.from('polls').update(payload).eq('id', editId);
        if (error) throw error;
        await logActivity(email, 'poll_update', `Updated poll: ${title}`);
        showToast('Poll updated!', 'success');
      } else {
        const { error } = await supabase.from('polls').insert(payload);
        if (error) throw error;
        await logActivity(email, 'poll_create', `Created poll: ${title}`);
        showToast('Poll created!', 'success');
      }
      setShowModal(false); fetchPolls();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Delete poll "${p.title}"?`)) return;
    await supabase.from('polls').delete().eq('id', p.id);
    await logActivity(email, 'poll_delete', `Deleted poll: ${p.title}`);
    showToast('Poll deleted', 'success');
    fetchPolls();
  };

  const toggleActive = async (p: any) => {
    await supabase.from('polls').update({ is_active: !p.is_active }).eq('id', p.id);
    showToast(p.is_active ? 'Poll closed' : 'Poll activated', 'success');
    fetchPolls();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Vote className="w-6 h-6 text-orange-burnt" />
          <h2 className="font-display font-extrabold text-xl text-navy-dark">Polls & Voting</h2>
        </div>
        <button onClick={openCreate}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-orange-burnt text-white font-display text-xs font-bold hover:bg-orange-burnt/90 transition-colors shadow-md">
          <Plus className="w-4 h-4" /><span>Create Poll</span>
        </button>
      </div>

      {isLoading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-orange-burnt mx-auto" /></div> : polls.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-navy-dark/10"><Vote className="w-10 h-10 text-navy-dark/15 mx-auto mb-2" /><p className="text-navy-dark/40 text-sm">No polls yet</p></div>
      ) : (
        <div className="space-y-4">
          {polls.map(p => {
            const opts: string[] = typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || []);
            const results = pollResults[p.id] || {};
            const totalVotes = Object.values(results).reduce((a: number, b: number) => a + b, 0);

            return (
              <div key={p.id} className="bg-white rounded-xl border border-navy-dark/10 shadow-sm p-5">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-display font-bold text-base text-navy-dark">{p.title}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                        {p.is_active ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    {p.description && <p className="text-navy-dark/50 text-xs font-sans">{p.description}</p>}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button onClick={() => toggleActive(p)} className={`p-1.5 rounded-lg transition-colors ${p.is_active ? 'hover:bg-red-50 text-red-400' : 'hover:bg-emerald-50 text-emerald-500'}`} title={p.is_active ? 'Close' : 'Activate'}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Vote Results */}
                <div className="space-y-2 mt-4">
                  {opts.map(opt => {
                    const count = results[opt] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <div key={opt} className="flex items-center space-x-3">
                        <span className="text-xs font-sans text-navy-dark w-28 truncate">{opt}</span>
                        <div className="flex-grow h-5 bg-navy-dark/5 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-burnt/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-navy-dark/50 w-16 text-right">{pct}% ({count})</span>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-navy-dark/40 font-mono text-right">Total: {totalVotes} votes</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div onClick={() => setShowModal(false)} className="absolute inset-0" />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm">{editId ? 'Edit Poll' : 'Create New Poll'}</h4>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Title *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Poll title"
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description"
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">Options *</label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="text" value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                        placeholder={`Option ${i + 1}`} className="flex-grow px-4 py-2 rounded-lg border border-navy-dark/15 outline-none text-sm" />
                      {options.length > 2 && (
                        <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setOptions([...options, ''])} className="text-orange-burnt text-xs font-bold font-display hover:underline">+ Add Option</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1.5">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 outline-none text-sm bg-white" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-orange-burnt w-4 h-4" />
                    <span className="text-sm font-sans text-navy-dark font-medium">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-navy-dark/15 text-navy-dark/60 font-display text-xs font-bold">Cancel</button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-lg bg-orange-burnt text-white font-display text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center space-x-1.5">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{editId ? 'Update' : 'Create'} Poll</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
