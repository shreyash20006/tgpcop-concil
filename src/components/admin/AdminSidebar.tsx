import React from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Megaphone, Calendar, PlusCircle, LogOut, GraduationCap } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'questions' | 'notices' | 'events' | 'add_new';
  setActiveTab: (tab: 'questions' | 'notices' | 'events' | 'add_new') => void;
  pendingQuestionsCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingQuestionsCount,
}) => {
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await supabase.auth.signOut();
    }
  };

  const navItems = [
    {
      id: 'questions' as const,
      name: 'Questions',
      icon: <Mail className="w-5 h-5" />,
      badge: pendingQuestionsCount > 0 ? pendingQuestionsCount : null,
    },
    {
      id: 'notices' as const,
      name: 'Notices Board',
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      id: 'events' as const,
      name: 'Events & Contests',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'add_new' as const,
      name: 'Add New Item',
      icon: <PlusCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-64 bg-navy-dark text-white flex flex-col justify-between h-screen sticky top-0 border-r border-white/5 shrink-0 z-20">
      
      {/* Upper Logo Section */}
      <div>
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-burnt flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight block leading-none">
              TGPCOP
            </span>
            <span className="text-[9px] text-orange-burnt block tracking-widest uppercase font-bold mt-0.5">
              Admin Console
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-4 space-y-2 mt-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg font-display text-sm font-semibold transition-all duration-200 outline-none ${
                  isActive
                    ? 'bg-orange-burnt text-white shadow-md shadow-orange-burnt/20'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="bg-orange-burnt border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <span className="text-[10px] uppercase font-bold text-white/40 block">Authenticated Admin</span>
            <span className="text-xs text-white/80 font-medium truncate block">
              council@tgpcop.edu
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white transition-colors text-white/60"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminSidebar;
