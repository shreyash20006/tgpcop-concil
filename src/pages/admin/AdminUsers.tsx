import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { useToast } from '../../components/admin/Toast';
import { logActivity } from '../../lib/logs';
import { sendAdminNotification } from '../../lib/brevo';
import { 
  getRoleDisplayName, 
  ASSIGNABLE_ROLES, 
  type Role 
} from '../../hooks/useRole';
import {
  Users, ShieldAlert, ShieldCheck, Trash2, 
  Loader2, Search, Filter, Ban
} from 'lucide-react';

const RoleBadgeMap: Record<Role, string> = {
  super_admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  developer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  president: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  vice_president: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  general_secretary: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  secretary: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  treasurer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  coordinator: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  student: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${RoleBadgeMap[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {getRoleDisplayName(role)}
    </span>
  );
};

export const AdminUsers: React.FC = () => {
  const { email: myEmail, role: myRole, userId: myUserId } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err: any) {
      toast.error('❌ Failed to load users: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...users];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.full_name && u.full_name.toLowerCase().includes(query))
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  // ── Toggle Suspension (is_active) ──────────────────────────────────────────
  const handleToggleActive = async (user: any) => {
    const nextActiveState = !user.is_active;
    const actionName = nextActiveState ? 'reactivate' : 'suspend';

    if (!window.confirm(`Are you sure you want to ${actionName} user "${user.email}"?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: nextActiveState, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      await logActivity(myEmail, 'user_active_toggle', `${nextActiveState ? 'Reactivated' : 'Suspended'} user "${user.email}"`);
      
      await sendAdminNotification({
        subject: `👤 User Account ${nextActiveState ? 'Reactivated' : 'Suspended'}`,
        title: `Roster Account Status Modification`,
        bodyHtml: `<p><b>User:</b> ${user.email}</p><p><b>Status:</b> ${nextActiveState ? 'ACTIVE' : 'SUSPENDED'}</p><p>Modified by: ${myEmail}</p>`,
      });

      toast.success(`✅ User account ${nextActiveState ? 'reactivated' : 'suspended'} successfully.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ Failed to update status: ${err.message}`);
    }
  };

  // ── Change Role Instantly ──────────────────────────────────────────────────
  const handleRoleChange = async (user: any, newRoleVal: Role) => {
    // Only super_admin or developer can assign super_admin role
    if (newRoleVal === 'super_admin' && myRole !== 'super_admin' && myRole !== 'developer') {
      toast.error('❌ Only Super Administrators can assign the Super Admin role.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRoleVal, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      await logActivity(myEmail, 'user_role_change', `Changed "${user.email}" role from "${user.role}" to "${newRoleVal}"`);
      
      await sendAdminNotification({
        subject: '👤 Roster Role Classification Modification',
        title: 'User Role Updated',
        bodyHtml: `<p><b>User:</b> ${user.email}</p><p><b>New Role:</b> ${getRoleDisplayName(newRoleVal)}</p><p>Modified by: ${myEmail}</p>`,
      });

      toast.success(`✅ Role updated to "${getRoleDisplayName(newRoleVal)}"`);
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ Failed to update role: ${err.message}`);
    }
  };

  // ── Delete User Profile ───────────────────────────────────────────────────
  const handleDelete = async (user: any) => {
    if (user.role === 'super_admin') {
      toast.error('❌ Cannot delete Super Admin accounts.');
      return;
    }

    if (!window.confirm(`Permanently delete user profile "${user.email}"? This action is irreversible.`)) return;

    try {
      // First attempt to delete from profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      // Optional cascade delete calling custom Auth user deletion RPC if exists
      try {
        await supabase.rpc('delete_user', { target_user_id: user.id });
      } catch (e) {
        // Fallback silently if custom RPC doesn't exist
      }

      await logActivity(myEmail, 'user_delete', `Permanently deleted profile "${user.email}"`);
      toast.success(`✅ User profile "${user.email}" permanently removed.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ Failed to delete profile: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white border border-navy-dark/10 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-navy-dark uppercase tracking-wide">
              User Management
            </h3>
            <p className="text-[10px] text-navy-dark/45 font-sans leading-none mt-0.5 uppercase tracking-wider font-semibold">
              Manage accounts, assign roles, and handle student council authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-navy-dark/10 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by email or full name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-dark/10 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt/10 outline-none text-xs font-sans text-navy-dark transition-all bg-[#050B18]/[0.02]"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-64 relative flex items-center">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-dark/40" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-navy-dark/10 focus:border-orange-burnt outline-none text-xs font-display font-bold uppercase tracking-wider text-navy-dark/70 bg-[#050B18]/[0.02] appearance-none cursor-pointer"
          >
            <option value="all">Filter by Role (All)</option>
            {ASSIGNABLE_ROLES.map(r => (
              <option key={r} value={r}>{getRoleDisplayName(r)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Users Table Grid */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-navy-dark/45 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-burnt" />
            <span className="font-display text-xs uppercase tracking-widest font-bold">Fetching Roster Profiles...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-dark/[0.03] border-b border-navy-dark/5">
                <tr>
                  {['Student Profile / Email', 'Assigned Role', 'Account status', 'Registration Date', 'Access Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-navy-dark/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-dark/5">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-navy-dark/[0.01] transition-colors select-none">
                    {/* User name & email details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name || 'avatar'} 
                            className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-burnt/10 border border-orange-burnt/25 flex items-center justify-center text-orange-burnt font-display font-bold text-xs shrink-0">
                            {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'ST'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="block font-display font-bold text-sm text-navy-dark leading-tight truncate">
                            {user.full_name || 'Unregistered Student'}
                          </span>
                          <span className="block text-[10px] text-navy-dark/50 font-sans mt-0.5 truncate font-semibold">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role allocation */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {user.role === 'super_admin' && myRole !== 'super_admin' ? (
                        <RoleBadge role={user.role} />
                      ) : (
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user, e.target.value as Role)}
                          className="text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-[#050B18]/[0.02] border-navy-dark/10 text-navy-dark/85 outline-none cursor-pointer hover:border-orange-burnt transition-colors select-none font-bold"
                        >
                          {ASSIGNABLE_ROLES.map(r => (
                            <option key={r} value={r} className="bg-white text-navy-dark normal-case">
                              {getRoleDisplayName(r)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Active/Suspended status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Active Access</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-5 py-4 text-xs font-semibold text-navy-dark/50 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>

                    {/* Suspend / delete actions */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.id !== myUserId && user.role !== 'super_admin' && (
                          <>
                            <button
                              onClick={() => handleToggleActive(user)}
                              title={user.is_active ? 'Suspend Account' : 'Reactivate Account'}
                              className={`p-2 rounded-xl transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                                user.is_active 
                                  ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' 
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(user)}
                              title="Delete Profile permanently"
                              className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-20 text-navy-dark/40 flex flex-col items-center">
                <Users className="w-12 h-12 mb-3 opacity-30 text-orange-burnt animate-pulse" />
                <p className="font-display text-sm font-bold uppercase tracking-wider">No matching roster users found.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminUsers;
