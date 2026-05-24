import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import type { Role } from '../../hooks/useRole';
import { useAuth } from '../../lib/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { role, email, isSuspended, isLoading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAccessDeniedExit = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // redirect to public website
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
        <p className="font-display text-sm tracking-wider text-white/70 uppercase">Verifying Security Access...</p>
      </div>
    );
  }

  // Not logged in
  if (!email) {
    return <Navigate to="/admin" replace />;
  }

  // Suspended account handling (kept for completeness)
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-dark p-8 border border-red-500/20 text-center rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Access Suspended</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 font-sans">
            Your administrator account (`{email}`) has been suspended by the Super Admin. Please contact the college administration to restore your access permissions.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-display font-bold rounded-lg text-sm transition-colors mx-auto w-full shadow-md shadow-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out From Console</span>
          </button>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-dark p-8 border border-red-500/30 text-center rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">🚫 Access Denied</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 font-sans">
            Your Google account (`{email}`) is not authorized for this admin panel. Only authorized college emails can access this console.
          </p>
          <p className="text-white/40 text-xs mb-6 font-sans">
            Contact: <span className="font-mono text-orange-burnt">president@tgpcop.edu</span> for access privileges.
          </p>
          <button
            onClick={handleAccessDeniedExit}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display font-bold rounded-lg text-sm transition-colors mx-auto w-full shadow-md shadow-orange-burnt/10 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Website</span>
          </button>
        </div>
      </div>
    );
  }

  // All good – render children
  return <>{children}</>;
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
        <p className="font-display text-sm tracking-wider text-white/70 uppercase">
          Verifying Security Access...
        </p>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  // Handle suspended administrator accounts (if isSuspended state is ever true)
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-dark p-8 border border-red-500/20 text-center rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Access Suspended</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 font-sans">
            Your administrator account (`{session.user.email}`) has been suspended by the Super Admin. Please contact the college administration to restore your access permissions.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-display font-bold rounded-lg text-sm transition-colors mx-auto w-full shadow-md shadow-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out From Console</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle case where user is authenticated but has no active role in admin_roles table (Access Denied page)
  if (!role) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-dark p-8 border border-red-500/30 text-center rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">🚫 Access Denied</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 font-sans">
            Your Google account (`{session.user.email}`) is not authorized for this admin panel. Only authorized college emails can access this console.
          </p>
          <p className="text-white/40 text-xs mb-6 font-sans">
            Contact: <span className="font-mono text-orange-burnt">president@tgpcop.edu</span> for access privileges.
          </p>
          <button
            onClick={handleAccessDeniedExit}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display font-bold rounded-lg text-sm transition-colors mx-auto w-full shadow-md shadow-orange-burnt/10 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Website</span>
          </button>
        </div>
      </div>
    );
  }

  // This file no longer provides its own context – authentication state is supplied by the global AuthProvider.
  // The ProtectedRoute simply renders its children when access checks pass.
  return <>{children}</>;
};

export default ProtectedRoute;
