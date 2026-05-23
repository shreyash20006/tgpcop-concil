import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { StatsCard } from '../../components/admin/StatsCard';
import { useRole, getPositionTitle, isDeveloper } from '../../hooks/useRole';
import { RequirePermission } from '../../components/admin/RequirePermission';
import { 
  Megaphone, 
  Calendar, 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  Clock, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { adminUser, can } = useRole();
  const isDev = isDeveloper(adminUser?.role);
  const isLimited = adminUser?.role === 'limited';
  const isTreasurer = adminUser?.role === 'treasurer';

  const [stats, setStats] = useState({
    totalQuestions: 0,
    pendingQuestions: 0,
    noticesCount: 0,
    activeEventsCount: 0,
  });
  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showQuestionStats = can('view_questions');
  const showNoticeStats = can('add_notices') || isTreasurer;
  const showEventStats = can('add_events') || isTreasurer;
  const showRecentQuestions = can('view_questions') && !isTreasurer;
  const showQuickActions =
    !isTreasurer &&
    !isLimited &&
    (can('add_notices') || can('add_events') || can('upload_gallery'));

  const firstName = adminUser?.name?.split(' ')[0] ?? 'Admin';

  const fetchStatsAndRecent = async () => {
    setIsLoading(true);
    try {
      if (showQuestionStats) {
        const { data: questions, error: qErr } = await supabase
          .from('questions')
          .select('status, created_at, student_name, student_year, directed_to, question_text');
        if (qErr) throw qErr;

        const totalQ = questions?.length || 0;
        const pendingQ = questions?.filter((q) => q.status === 'pending').length || 0;

        setStats((prev) => ({
          ...prev,
          totalQuestions: totalQ,
          pendingQuestions: pendingQ,
        }));

        if (showRecentQuestions) {
          const sortedQ =
            questions?.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)) || [];
          setRecentQuestions(sortedQ.slice(0, 5));
        }
      }

      if (showNoticeStats) {
        const { count: noticesCount, error: nErr } = await supabase
          .from('notices')
          .select('*', { count: 'exact', head: true });
        if (nErr) throw nErr;
        setStats((prev) => ({ ...prev, noticesCount: noticesCount || 0 }));
      }

      if (showEventStats) {
        const { count: activeEventsCount, error: eErr } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        if (eErr) throw eErr;
        setStats((prev) => ({ ...prev, activeEventsCount: activeEventsCount || 0 }));
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndRecent();
  }, [adminUser?.role]);

  const statCards = [
    showQuestionStats && {
      key: 'total',
      label: 'Total Questions',
      value: stats.totalQuestions,
      icon: <HelpCircle className="w-6 h-6" />,
      trendColor: 'navy' as const,
    },
    showQuestionStats && !isLimited && {
      key: 'pending',
      label: 'Pending Questions',
      value: stats.pendingQuestions,
      icon: <AlertCircle className="w-6 h-6" />,
      trendColor: 'orange' as const,
    },
    showNoticeStats && !isLimited && {
      key: 'notices',
      label: 'Notices Published',
      value: stats.noticesCount,
      icon: <Megaphone className="w-6 h-6" />,
      trendColor: 'amber' as const,
    },
    showEventStats && !isLimited && {
      key: 'events',
      label: 'Active Events',
      value: stats.activeEventsCount,
      icon: <Calendar className="w-6 h-6" />,
      trendColor: 'green' as const,
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ReactNode;
    trendColor: 'navy' | 'orange' | 'amber' | 'green';
  }>;

  return (
    <RequirePermission permission="view_dashboard">
      <div className="space-y-8 animate-in fade-in duration-300">

        {adminUser && (
          <div
            className={`rounded-2xl p-6 shadow-xs border ${
              isDev
                ? 'bg-gradient-to-br from-orange-burnt/10 to-amber-500/5 border-orange-burnt/30'
                : 'bg-white border-navy-dark/10'
            }`}
          >
            <h2 className="font-display font-extrabold text-xl text-navy-dark">
              {isDev ? (
                <>Welcome, {firstName}! 🛠️</>
              ) : (
                <>Welcome back, {firstName}! 👋</>
              )}
            </h2>
            <p className="text-sm text-navy-dark/55 font-sans mt-1">
              {isDev ? (
                <span className="font-semibold text-orange-burnt">
                  Developer Mode — Full Access
                </span>
              ) : (
                <>Role: {getPositionTitle(adminUser.role)}</>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center text-navy-dark/45">
            <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
            <p className="font-display text-sm tracking-wider uppercase">Fetching console metrics...</p>
          </div>
        ) : (
          <>
            {statCards.length > 0 && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                  statCards.length >= 4 ? 'lg:grid-cols-4' : statCards.length === 3 ? 'lg:grid-cols-3' : ''
                }`}
              >
                {statCards.map((card) => (
                  <StatsCard
                    key={card.key}
                    label={card.label}
                    value={card.value}
                    icon={card.icon}
                    trendColor={card.trendColor}
                  />
                ))}
              </div>
            )}

            {(showRecentQuestions || showQuickActions) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {showRecentQuestions && (
                  <div
                    className={`bg-white border border-navy-dark/10 rounded-2xl p-6 shadow-sm space-y-4 ${
                      showQuickActions ? 'lg:col-span-8' : 'lg:col-span-12'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-navy-dark/5 pb-4">
                      <h3 className="font-display font-extrabold text-base text-navy-dark flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-orange-burnt" />
                        <span>Recent Student Inquiries</span>
                      </h3>
                      <Link
                        to="/admin/questions"
                        className="inline-flex items-center space-x-1 text-xs font-display font-extrabold text-orange-burnt hover:text-navy-dark transition-colors group"
                      >
                        <span>Manage All</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-navy-dark/10 text-[10px] font-bold uppercase tracking-wider text-navy-dark/40 bg-gray-50/50">
                            <th className="px-4 py-2">Student</th>
                            <th className="px-4 py-2">To</th>
                            <th className="px-4 py-2">Question Summary</th>
                            <th className="px-4 py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-dark/5">
                          {recentQuestions.map((q, idx) => (
                            <tr key={idx} className="hover:bg-navy-dark/[0.01] transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-display font-bold text-xs text-navy-dark">{q.student_name}</span>
                                  <span className="text-[9px] text-navy-dark/50 font-sans">{q.student_year}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-orange-burnt">
                                {q.directed_to}
                              </td>
                              <td className="px-4 py-3 text-xs text-navy-dark/70 max-w-xs truncate">
                                &quot;{q.question_text}&quot;
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <span
                                  className={`inline-block text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                    q.status === 'answered'
                                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                      : q.status === 'seen'
                                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                      : 'bg-orange-burnt/10 text-orange-burnt border-orange-burnt/20'
                                  }`}
                                >
                                  {q.status}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {recentQuestions.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-8">
                                <HelpCircle className="w-8 h-8 text-navy-dark/15 mx-auto mb-2" />
                                <p className="text-xs text-navy-dark/40 font-display">No questions submitted yet.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {showQuickActions && (
                  <div className="lg:col-span-4 bg-navy-dark text-white rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-4">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:20px_20px] opacity-15 pointer-events-none" />

                    <div className="border-b border-white/10 pb-3 z-10 relative">
                      <h3 className="font-display font-extrabold text-base text-orange-burnt">
                        Quick Tasks Panel
                      </h3>
                      <p className="text-[10px] text-white/50 font-sans mt-0.5">
                        Publish updates and portfolio photos live to the college portal.
                      </p>
                    </div>

                    <div className="space-y-3 z-10 relative">
                      {can('add_notices') && (
                        <Link
                          to="/admin/notices"
                          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-orange-burnt text-xs font-bold font-display uppercase tracking-wider transition-all duration-300 group shadow-sm border border-white/5"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Plus className="w-4 h-4 text-orange-burnt group-hover:text-white transition-colors" />
                            <span>📢 Add Announcement</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )}

                      {can('add_events') && (
                        <Link
                          to="/admin/events"
                          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-orange-burnt text-xs font-bold font-display uppercase tracking-wider transition-all duration-300 group shadow-sm border border-white/5"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Plus className="w-4 h-4 text-orange-burnt group-hover:text-white transition-colors" />
                            <span>🎉 Add Live Event</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )}

                      {can('upload_gallery') && (
                        <Link
                          to="/admin/gallery"
                          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-orange-burnt text-xs font-bold font-display uppercase tracking-wider transition-all duration-300 group shadow-sm border border-white/5"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Plus className="w-4 h-4 text-orange-burnt group-hover:text-white transition-colors" />
                            <span>📸 Upload Gallery Image</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </RequirePermission>
  );
};

export default AdminDashboard;
