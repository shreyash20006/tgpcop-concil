import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { QuestionRow } from '../../components/admin/QuestionRow';
import { NoticeModal } from '../../components/admin/NoticeModal';
import { EventModal } from '../../components/admin/EventModal';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  Megaphone, 
  Calendar, 
  Edit3, 
  Trash2, 
  Pin,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'notices' | 'events' | 'add_new'>('questions');
  
  // Data States
  const [questions, setQuestions] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Count States
  const [pendingCount, setPendingCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'seen' | 'answered'>('All');
  const [memberFilter, setMemberFilter] = useState('All');

  // Modal Open/Edit States
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  // FETCH DATA ROUTINES
  const fetchQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
      
      // Calculate active counts
      const pending = data?.filter((q) => q.status === 'pending').length || 0;
      const answered = data?.filter((q) => q.status === 'answered').length || 0;
      setPendingCount(pending);
      setAnsweredCount(answered);
    } catch (err: any) {
      console.error('Error fetching questions:', err.message);
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Error fetching notices:', err.message);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err.message);
    }
  }, []);

  // Global Loader
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchQuestions(), fetchNotices(), fetchEvents()]);
    setIsLoading(false);
  }, [fetchQuestions, fetchNotices, fetchEvents]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // DELETE OPERATIONS
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Delete this notice board item permanently?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      fetchNotices();
    } catch (err: any) {
      alert(`Error deleting notice: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this timeline event permanently?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (err: any) {
      alert(`Error deleting event: ${err.message}`);
    }
  };

  // FILTER LOGIC FOR QUESTIONS
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.directed_to.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesMember = memberFilter === 'All' || q.directed_to === memberFilter;

    return matchesSearch && matchesStatus && matchesMember;
  });

  // Extract unique targeted council names for the drop filter
  const directedToOptions = Array.from(new Set(questions.map((q) => q.directed_to)));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-light w-full">
      {/* 1. LEFT: AUTHENTICATED SIDEBAR NAVIGATION */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingQuestionsCount={pendingCount} 
      />

      {/* 2. RIGHT: SCROLLABLE OPERATIONS VIEWS */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* Upper Header bar */}
        <header className="bg-white border-b border-navy-dark/5 px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-navy-dark uppercase">
              {activeTab === 'questions' && '📬 Q&A Management'}
              {activeTab === 'notices' && '📢 Notices Board Center'}
              {activeTab === 'events' && '🎉 Timeline & Contests'}
              {activeTab === 'add_new' && '➕ Operations Shortcuts'}
            </h1>
            <p className="text-xs text-navy-dark/60 mt-0.5">
              Review and publish updates for Gaikwad Patil College of Pharmacy.
            </p>
          </div>
          
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-1.5 px-4 py-2 border border-navy-dark/15 hover:bg-navy-dark hover:text-white rounded-lg font-display text-xs font-semibold transition-colors"
          >
            <span>Reload Data</span>
          </button>
        </header>

        {/* Primary Views viewport container */}
        <div className="flex-grow overflow-y-auto p-8">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center text-navy-dark/40">
              <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
              <p className="font-display text-sm tracking-wider uppercase">Loading database records...</p>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* TAB 1: QUESTIONS VIEW */}
              {/* ============================================================== */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  {/* Counts banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-navy-dark/5 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-navy-dark/40 block mb-1">
                          Inquiries Pending Review
                        </span>
                        <span className="font-display font-extrabold text-3xl text-orange-burnt block">
                          {pendingCount}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-orange-burnt/10 flex items-center justify-center text-orange-burnt">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white border border-navy-dark/5 p-5 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-navy-dark/40 block mb-1">
                          Resolved Questions
                        </span>
                        <span className="font-display font-extrabold text-3xl text-emerald-500 block">
                          {answeredCount}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Filter panel */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-navy-dark/5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:flex-grow">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-navy-dark/30" />
                      <input
                        type="text"
                        placeholder="Search student names, questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm transition-colors"
                      />
                    </div>
                    
                    <div className="flex space-x-3 w-full sm:w-auto shrink-0">
                      {/* Status */}
                      <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:w-36 px-3 py-2.5 rounded-lg border border-navy-dark/15 outline-none text-sm bg-white"
                      >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="seen">Seen</option>
                        <option value="answered">Answered</option>
                      </select>
                      
                      {/* Directed to */}
                      <select
                        value={memberFilter}
                        onChange={(e) => setMemberFilter(e.target.value)}
                        className="flex-1 sm:w-44 px-3 py-2.5 rounded-lg border border-navy-dark/15 outline-none text-sm bg-white"
                      >
                        <option value="All">All Recipients</option>
                        <option value="General Council">General Council</option>
                        {directedToOptions.map((name) => (
                          name !== 'General Council' && (
                            <option key={name} value={name}>{name}</option>
                          )
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Questions Grid Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-navy-dark/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-navy-dark text-white font-display text-[10px] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3 text-center w-10">Collapse</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Course Year</th>
                            <th className="px-6 py-3">Directed To</th>
                            <th className="px-6 py-3">Snippet</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-dark/5">
                          {filteredQuestions.map((q) => (
                            <QuestionRow 
                              key={q.id} 
                              question={q} 
                              onRefresh={fetchQuestions} 
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Empty questions */}
                    {filteredQuestions.length === 0 && (
                      <div className="text-center py-20">
                        <HelpCircle className="w-12 h-12 text-navy-dark/20 mx-auto mb-3" />
                        <p className="font-display text-sm text-navy-dark/40">No queries found matching the selected filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: NOTICES VIEW */}
              {/* ============================================================== */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  {/* Floating Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setNoticeToEdit(null);
                        setIsNoticeModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 py-3 px-5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display text-sm font-semibold rounded-lg shadow-md hover:translate-y-[-1px] transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add New Notice</span>
                    </button>
                  </div>

                  {/* Notices Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-navy-dark/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-navy-dark text-white font-display text-[10px] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Is Pinned</th>
                            <th className="px-6 py-3">PDF URL</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-dark/5">
                          {notices.map((n) => (
                            <tr key={n.id} className="hover:bg-navy-dark/[0.01] transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="bg-navy-dark/5 text-navy-dark text-[10px] font-bold px-2 py-0.5 rounded border border-navy-dark/10 uppercase tracking-widest">
                                  {n.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-navy-dark font-display max-w-sm truncate">
                                {n.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {n.is_pinned ? (
                                  <span className="inline-flex items-center text-xs text-orange-burnt font-bold uppercase">
                                    <Pin className="w-3.5 h-3.5 fill-current mr-1" />
                                    Pinned
                                  </span>
                                ) : (
                                  <span className="text-xs text-navy-dark/30">No</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs text-navy-dark/50 max-w-xs truncate">
                                {n.pdf_url || '—'}
                              </td>
                              <td className="px-6 py-4 text-xs text-navy-dark/50 whitespace-nowrap">
                                {new Date(n.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setNoticeToEdit(n);
                                    setIsNoticeModalOpen(true);
                                  }}
                                  className="p-1.5 bg-navy-dark/5 text-navy-dark hover:bg-navy-dark hover:text-white rounded-lg transition-colors inline-flex"
                                  title="Edit Notice"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNotice(n.id)}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors inline-flex"
                                  title="Delete Notice"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {notices.length === 0 && (
                      <div className="text-center py-20">
                        <Megaphone className="w-12 h-12 text-navy-dark/20 mx-auto mb-3" />
                        <p className="font-display text-sm text-navy-dark/40">No notice board items found in database.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: EVENTS VIEW */}
              {/* ============================================================== */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  {/* Floating Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setEventToEdit(null);
                        setIsEventModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 py-3 px-5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display text-sm font-semibold rounded-lg shadow-md hover:translate-y-[-1px] transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add New Event</span>
                    </button>
                  </div>

                  {/* Events Table */}
                  <div className="bg-white rounded-xl shadow-sm border border-navy-dark/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-navy-dark text-white font-display text-[10px] font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Deadline</th>
                            <th className="px-6 py-3">Prizes</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-dark/5">
                          {events.map((e) => (
                            <tr key={e.id} className="hover:bg-navy-dark/[0.01] transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                  e.type === 'competition' 
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                                    : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                }`}>
                                  {e.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-navy-dark font-display max-w-sm truncate">
                                {e.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {e.is_active ? (
                                  <span className="text-xs text-emerald-600 font-bold uppercase">Active</span>
                                ) : (
                                  <span className="text-xs text-navy-dark/30 uppercase">Inactive</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs text-navy-dark/60 font-medium whitespace-nowrap">
                                {e.deadline ? new Date(e.deadline).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-6 py-4 text-xs text-navy-dark/50 max-w-xs truncate">
                                {e.prize_info || '—'}
                              </td>
                              <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEventToEdit(e);
                                    setIsEventModalOpen(true);
                                  }}
                                  className="p-1.5 bg-navy-dark/5 text-navy-dark hover:bg-navy-dark hover:text-white rounded-lg transition-colors inline-flex"
                                  title="Edit Event"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(e.id)}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors inline-flex"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {events.length === 0 && (
                      <div className="text-center py-20">
                        <Calendar className="w-12 h-12 text-navy-dark/20 mx-auto mb-3" />
                        <p className="font-display text-sm text-navy-dark/40">No events or competitions found in database.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: ADD NEW VIEW */}
              {/* ============================================================== */}
              {activeTab === 'add_new' && (
                <div className="max-w-4xl mx-auto py-10 space-y-8">
                  <div className="text-center max-w-lg mx-auto mb-10">
                    <h2 className="font-display font-extrabold text-2xl text-navy-dark">Create New Entry</h2>
                    <p className="text-navy-dark/65 text-sm mt-1">Select a workspace entry target below to immediately prompt its database compilation wizard.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Notice card */}
                    <div 
                      onClick={() => {
                        setNoticeToEdit(null);
                        setIsNoticeModalOpen(true);
                      }}
                      className="bg-white border border-navy-dark/5 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-orange-burnt/40 transition-all text-center cursor-pointer group flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-orange-burnt/10 text-orange-burnt flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Megaphone className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy-dark mb-2">📢 Notice Announcement</h3>
                      <p className="text-xs text-navy-dark/60 leading-relaxed max-w-xs mb-6">
                        Publish schedules, academic schedules, libraries announcements, or zero-tolerance warning policy notices.
                      </p>
                      <span className="text-xs font-display font-bold text-orange-burnt">Open Editor →</span>
                    </div>

                    {/* Event card */}
                    <div 
                      onClick={() => {
                        setEventToEdit(null);
                        setIsEventModalOpen(true);
                      }}
                      className="bg-white border border-navy-dark/5 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-orange-burnt/40 transition-all text-center cursor-pointer group flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-orange-burnt/10 text-orange-burnt flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy-dark mb-2">🎉 Campus Activity / Event</h3>
                      <p className="text-xs text-navy-dark/60 leading-relaxed max-w-xs mb-6">
                        Publish science symposiums, world pharmacist rallies, or active countdown quiz competitions.
                      </p>
                      <span className="text-xs font-display font-bold text-orange-burnt">Open Editor →</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* ============================================================== */}
      {/* GLOBAL OVERLAY MODALS */}
      {/* ============================================================== */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => {
          setIsNoticeModalOpen(false);
          setNoticeToEdit(null);
        }}
        onRefresh={fetchNotices}
        noticeToEdit={noticeToEdit}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onRefresh={fetchEvents}
        eventToEdit={eventToEdit}
      />

    </div>
  );
};

export default AdminDashboard;
