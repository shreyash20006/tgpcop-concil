import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/admin/Toast';
import { logActivity } from '../../lib/logs';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { ShieldAlert, Loader2, Search, MessageSquare } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  received: 'bg-amber-50 text-amber-600 border-amber-200',
  investigating: 'bg-blue-50 text-blue-600 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export const AdminComplaints: React.FC = () => {
  const toast = useToast();
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(msg);
    else toast.error(msg);
  };
  const { email } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Notes modal
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
    await logActivity(email, 'complaint_status', `Changed complaint ${id.slice(0, 8)} to ${newStatus}`);
    showToast(`Status → ${newStatus}`, 'success');
    fetchAll();
  };

  const saveNotes = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    await supabase.from('complaints').update({ admin_notes: adminNotes, status: 'resolved' }).eq('id', selectedId);
    await logActivity(email, 'complaint_resolve', `Resolved complaint ${selectedId.slice(0, 8)}`);
    showToast('Complaint resolved with notes', 'success');
    setSelectedId(null); setAdminNotes('');
    setIsSaving(false);
    fetchAll();
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.description.toLowerCase().includes(search.toLowerCase()) || c.incident_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { received: complaints.filter(c => c.status === 'received').length, investigating: complaints.filter(c => c.status === 'investigating').length, resolved: complaints.filter(c => c.status === 'resolved').length };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <ShieldAlert className="w-6 h-6 text-red-500" />
        <h2 className="font-display font-extrabold text-xl text-navy-dark">Anonymous Complaints</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['received', 'investigating', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`rounded-xl border p-4 text-center transition-all ${statusFilter === s ? 'ring-2 ring-orange-burnt' : ''} ${STATUS_COLORS[s]}`}>
            <p className="font-display font-extrabold text-xl">{counts[s]}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider capitalize">{s}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 outline-none text-sm bg-white" />
      </div>

      {isLoading ? <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-orange-burnt mx-auto" /></div> : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-navy-dark/10"><ShieldAlert className="w-10 h-10 text-navy-dark/15 mx-auto mb-2" /><p className="text-navy-dark/40 text-sm">No complaints found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-navy-dark/10 shadow-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">{c.incident_type}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </div>
                <span className="text-[10px] text-navy-dark/40">{new Date(c.created_at).toLocaleDateString()} {c.location && `• ${c.location}`}</span>
              </div>
              <p className="text-sm text-navy-dark/70 font-sans leading-relaxed mb-4">{c.description}</p>
              {c.admin_notes && (
                <div className="bg-emerald-50 rounded-lg p-3 mb-3 border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 mb-1">Admin Notes:</p>
                  <p className="text-xs text-emerald-800 font-sans">{c.admin_notes}</p>
                </div>
              )}
              {c.status !== 'resolved' && (
                <div className="flex space-x-2">
                  {c.status === 'received' && (
                    <button onClick={() => updateStatus(c.id, 'investigating')}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors">
                      Mark Investigating
                    </button>
                  )}
                  <button onClick={() => { setSelectedId(c.id); setAdminNotes(c.admin_notes || ''); }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors">
                    Resolve with Notes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Notes Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div onClick={() => setSelectedId(null)} className="absolute inset-0" />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="bg-emerald-700 text-white px-6 py-4">
              <h4 className="font-display font-extrabold text-sm flex items-center space-x-2"><MessageSquare className="w-4 h-4" /><span>Resolution Notes</span></h4>
            </div>
            <div className="p-6 space-y-4">
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4} placeholder="Describe the actions taken to resolve this complaint..."
                className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 outline-none text-sm resize-none" />
              <div className="flex space-x-3">
                <button onClick={() => setSelectedId(null)} className="flex-1 py-2.5 rounded-lg border border-navy-dark/15 text-navy-dark/60 font-display text-xs font-bold">Cancel</button>
                <button onClick={saveNotes} disabled={isSaving} className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-display text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Mark Resolved</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
