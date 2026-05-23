import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/admin/Toast';
import { ClipboardList, Loader2, Download, Users, Search } from 'lucide-react';

export const AdminRegistrations: React.FC = () => {
  const toast = useToast();
  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(msg);
    else toast.error(msg);
  };
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('events').select('id, title, capacity, registered_count').order('created_at', { ascending: false });
      setEvents(data || []);
      setIsLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setRegistrations([]); return; }
    const fetch = async () => {
      setIsLoadingRegs(true);
      const { data } = await supabase.from('event_registrations').select('*').eq('event_id', selectedEventId).order('created_at', { ascending: false });
      setRegistrations(data || []);
      setIsLoadingRegs(false);
    };
    fetch();
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const filteredRegs = search ? registrations.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())) : registrations;

  const exportCSV = () => {
    if (filteredRegs.length === 0) return;
    const headers = ['Name', 'Email', 'WhatsApp', 'Year', 'Registered On'];
    const rows = filteredRegs.map(r => [r.full_name, r.email, r.whatsapp || '-', r.year, new Date(r.created_at).toLocaleDateString()]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `registrations_${selectedEvent?.title || 'event'}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <ClipboardList className="w-6 h-6 text-orange-burnt" />
          <h2 className="font-display font-extrabold text-xl text-navy-dark">Event Registrations</h2>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl border border-navy-dark/10 p-5 shadow-sm space-y-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60 mb-1">Select Event</label>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-orange-burnt" /> : (
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans bg-white">
            <option value="">— Choose an event —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title} ({ev.registered_count || 0}/{ev.capacity || '∞'})</option>)}
          </select>
        )}

        {/* Stats Bar */}
        {selectedEvent && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
              <p className="text-lg font-display font-extrabold text-emerald-700">{registrations.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <p className="text-lg font-display font-extrabold text-blue-700">{selectedEvent.capacity || '∞'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Capacity</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
              <p className="text-lg font-display font-extrabold text-amber-700">{Math.max(0, (selectedEvent.capacity || 100) - registrations.length)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Left</p>
            </div>
          </div>
        )}
      </div>

      {/* Registrations Table */}
      {selectedEventId && (
        <div className="bg-white rounded-xl border border-navy-dark/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-navy-dark/5 flex items-center justify-between flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/30" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                className="pl-10 pr-4 py-2 rounded-lg border border-navy-dark/15 outline-none text-sm w-64" />
            </div>
            <button onClick={exportCSV} disabled={filteredRegs.length === 0}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-navy-dark text-white font-display text-xs font-bold hover:bg-orange-burnt transition-colors disabled:opacity-50">
              <Download className="w-3.5 h-3.5" /><span>Export CSV</span>
            </button>
          </div>

          {isLoadingRegs ? (
            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-orange-burnt mx-auto" /></div>
          ) : filteredRegs.length === 0 ? (
            <div className="p-12 text-center text-navy-dark/40 text-sm font-sans">
              <Users className="w-8 h-8 text-navy-dark/15 mx-auto mb-2" />
              No registrations yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-dark/[0.02]">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-navy-dark/50">
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">WhatsApp</th>
                    <th className="text-left px-4 py-3">Year</th>
                    <th className="text-left px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((r, i) => (
                    <tr key={r.id} className="border-t border-navy-dark/5 hover:bg-orange-burnt/[0.02] transition-colors">
                      <td className="px-4 py-3 text-navy-dark/40 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-navy-dark">{r.full_name}</td>
                      <td className="px-4 py-3 text-navy-dark/70">{r.email}</td>
                      <td className="px-4 py-3 text-navy-dark/60">{r.whatsapp || '—'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold">{r.year}</span></td>
                      <td className="px-4 py-3 text-navy-dark/50 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
