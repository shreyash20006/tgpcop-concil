import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, GraduationCap, Mail, Lock, Eye, EyeOff, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/admin/Toast';
import { logAction } from '../../lib/logger';
import { ScienceBackground } from '../../components/ScienceBackground';
import { DNALoader } from '../../components/DNALoader';
import { useAuth } from '../../lib/AuthProvider';

export const AdminLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginMode, setLoginMode] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { role, email, userId, isLoading } = useAuth();

  // Redirect map based on role
  const getRedirectPath = (userRole: string | null): string => {
    switch (userRole) {
      case 'super_admin': return '/super-admin';
      case 'developer':   return '/admin/developer';
      case 'admin':       return '/admin/dashboard';
      case 'president':   return '/president';
      case 'vice_president': return '/vice-president';
      case 'general_secretary': return '/general-secretary';
      case 'secretary':   return '/secretary';
      case 'treasurer':   return '/treasurer';
      case 'coordinator': return '/admin/dashboard';
      case 'student':     return '/dashboard';
      default:            return '/admin/dashboard';
    }
  };

  useEffect(() => {
    if (!isLoading && email) {
      const redirectPath = getRedirectPath(role);

      console.group('🔐 TGPCOP Auth Debug Log');
      console.log('Auth User ID:   ', userId);
      console.log('Auth Email:     ', email);
      console.log('Profile Role:   ', role);
      console.log('Provider:       ', 'google/email');
      console.log('Redirect Path:  ', redirectPath);
      console.groupEnd();

      logAction('LOGIN', `User ${email} signed in with role=${role} → redirect=${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
  }, [role, email, userId, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/admin',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const errMsg = err.message || 'Failed to initialize Google Sign-in.';
      setErrorMessage(errMsg);
      toast.error(`❌ Google login failed! ${errMsg}`);
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim().toLowerCase(),
        password: passwordInput,
      });

      if (error) throw error;

      console.group('🔐 TGPCOP Email Auth Debug Log');
      console.log('Auth User ID:  ', data.user?.id);
      console.log('Auth Email:    ', data.user?.email);
      console.log('Provider:      ', data.user?.app_metadata?.provider);
      console.groupEnd();

      toast.success(`✅ Signed in as ${data.user?.email}`);
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Check your credentials.';
      setErrorMessage(errMsg);
      toast.error(`❌ ${errMsg}`);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050B18] flex items-center justify-center p-4 overflow-hidden">
      <ScienceBackground />
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-orange-burnt/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gold-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 grid-bg-overlay opacity-15 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-white/50 hover:text-white mb-6 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-orange-burnt" />
          <span>Back to Website</span>
        </Link>

        <div className="bg-[#0D1B3E]/85 border border-orange-burnt/25 backdrop-blur-[16px] rounded-2xl p-8 shadow-[0_8px_32px_rgba(5,11,24,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-burnt/5 rounded-bl-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-burnt to-[#E06D2B] flex items-center justify-center text-white shadow-lg mb-4 border border-white/5 shadow-orange-burnt/15">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="font-display font-extrabold text-xl text-white">Student Council Roster</h1>
            <p className="text-orange-burnt text-xs tracking-widest uppercase font-bold mt-1">Admin Panel Login</p>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6 animate-pulse">
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Executives Only</span>
            </div>
          </div>

          {/* Login Mode Toggle */}
          <div className="flex rounded-xl bg-white/[0.04] border border-white/10 p-1 mb-6">
            <button
              onClick={() => { setLoginMode('google'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'google'
                  ? 'bg-orange-burnt text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Google Login
            </button>
            <button
              onClick={() => { setLoginMode('email'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'email'
                  ? 'bg-orange-burnt text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Email + Password
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 leading-relaxed"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Google Login */}
          {loginMode === 'google' && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="relative w-full flex items-center justify-center py-3.5 px-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-navy-dark font-display font-extrabold rounded-xl text-sm sm:text-base shadow-lg hover:shadow-white/10 active:scale-98 transition-all duration-200 cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="flex items-center space-x-3">
                    <DNALoader />
                    <span className="text-orange-burnt text-xs sm:text-sm font-semibold">Signing in...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01-.97 4.14v3.45h1.59c3.27-3 5.43-7.42 5.43-12.44z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.17 0-5.85-2.14-6.81-5.02H1.23v3.1A11.996 11.996 0 0012 24z" />
                      <path fill="#FBBC05" d="M5.19 14.24A7.2 7.2 0 014.8 12c0-.79.13-1.57.39-2.31V6.59H1.23A11.96 11.96 0 000 12c0 2.23.6 4.32 1.66 6.13l3.53-2.89z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.34 0 3.37 2.67 1.23 6.59l3.96 3.1c.96-2.88 3.64-5.02 6.81-5.02z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
              <p className="text-white/50 text-[10px] text-center font-sans">
                Use your Google Workspace or Gmail account linked to this system.
              </p>
              <button
                onClick={() => setLoginMode('email')}
                className="w-full text-[10px] text-orange-burnt/70 hover:text-orange-burnt text-center transition-colors"
              >
                Using a workspace email? Switch to Email + Password →
              </button>
            </div>
          )}

          {/* Email + Password Login */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] text-white/50 font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="developer@tgpcopcouncil.online"
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-burnt/50 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-white/50 font-bold uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-burnt/50 text-white placeholder-white/20 rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="relative w-full flex items-center justify-center py-3.5 px-4 bg-orange-burnt hover:bg-orange-burnt/90 disabled:opacity-50 text-white font-display font-extrabold rounded-xl text-sm shadow-lg hover:shadow-orange-burnt/20 active:scale-98 transition-all duration-200"
              >
                {isLoggingIn ? (
                  <div className="flex items-center space-x-3">
                    <DNALoader />
                    <span className="text-white/80 text-xs font-semibold">Verifying...</span>
                  </div>
                ) : (
                  <span>Sign In with Email</span>
                )}
              </button>

              <p className="text-white/40 text-[10px] text-center font-sans">
                Default password for workspace accounts: <span className="text-orange-burnt font-mono">TGPCOPDev@2024!</span>
              </p>
            </form>
          )}

          {/* Auth Debug Panel */}
          <div className="mt-6 border-t border-white/5 pt-4">
            <button
              onClick={() => setShowDebug(v => !v)}
              className="w-full flex items-center justify-center space-x-1.5 text-white/20 hover:text-white/40 text-[10px] transition-colors"
            >
              <Bug className="w-3 h-3" />
              <span>{showDebug ? 'Hide' : 'Show'} Auth Debug Panel</span>
            </button>

            {showDebug && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-[10px] space-y-1.5"
              >
                <p className="text-white/30 uppercase tracking-wider font-bold mb-2">🔍 Auth State</p>
                <div className="flex justify-between">
                  <span className="text-white/40">Loading:</span>
                  <span className={isLoading ? 'text-amber-400' : 'text-emerald-400'}>{String(isLoading)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Email:</span>
                  <span className="text-white/70">{email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">User ID:</span>
                  <span className="text-white/50 truncate ml-4">{userId?.slice(0, 16) || '—'}…</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Role:</span>
                  <span className={role ? 'text-orange-burnt font-bold' : 'text-red-400'}>{role || 'null'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Redirect:</span>
                  <span className="text-white/60">{role ? getRedirectPath(role) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">DB Project:</span>
                  <span className="text-white/40">fmvmtzobjbxwmavwwkqx</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-[10px] sm:text-xs mt-6 tracking-wide leading-none">
          🔐 Secure Auditor Audit Active. Activities are fully logged.
        </p>
      </motion.div>
    </div>
  );

};

export default AdminLogin;
