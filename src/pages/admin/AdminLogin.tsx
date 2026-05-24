import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/admin/Toast';
import { logAction } from '../../lib/logger';

export const AdminLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // If user is already authenticated, send them to dashboard immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        logAction('LOGIN', 'Administrator signed in via Google OAuth');
        navigate('/admin/dashboard', { replace: true });
      }
    });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/admin/dashboard',
        },
      });

      if (error) throw error;
    } catch (err: any) {
      const errMsg = err.message || 'Failed to initialize Google Sign-in. Please try again.';
      setErrorMessage(errMsg);
      toast.error(`❌ Google login failed! ${errMsg}`);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-navy-dark flex items-center justify-center p-4 overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 -left-10 w-96 h-96 bg-orange-burnt/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gold-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] opacity-25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-white/50 hover:text-white mb-6 text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Website</span>
        </Link>

        <div className="glass-panel-dark rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-burnt/5 rounded-bl-full pointer-events-none" />

          {/* TGPCOP Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-burnt flex items-center justify-center text-white shadow-lg mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="font-display font-extrabold text-xl text-white">Student Council</h1>
            <p className="text-white/60 text-xs tracking-wider uppercase font-bold">Admin Portal</p>
          </div>

          {/* Authorized Personnel Badge */}
          <div className="flex justify-center mb-8 animate-pulse">
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Personnel Only</span>
            </div>
          </div>

          {/* Display Warning Error */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-6 leading-relaxed"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Google Sign-in Trigger */}
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="relative w-full flex items-center justify-center py-3.5 px-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-navy-dark font-display font-extrabold rounded-lg text-sm sm:text-base shadow-lg hover:shadow-white/10 active:scale-98 transition-all duration-200"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-3 text-orange-burnt" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  {/* Styled Vector Google Icon G */}
                  <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01-.97 4.14v3.45h1.59c3.27-3 5.43-7.42 5.43-12.44z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.17 0-5.85-2.14-6.81-5.02H1.23v3.1A11.996 11.996 0 0012 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.19 14.24A7.2 7.2 0 014.8 12c0-.79.13-1.57.39-2.31V6.59H1.23A11.96 11.96 0 000 12c0 2.23.6 4.32 1.66 6.13l3.53-2.89z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.34 0 3.37 2.67 1.23 6.59l3.96 3.1c.96-2.88 3.64-5.02 6.81-5.02z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-white/70 text-xs font-sans">
                "Use your college Google account to login"
              </p>
              <p className="text-amber-500/90 text-[10px] font-semibold uppercase tracking-wider leading-relaxed">
                ⚠️ Only authorized emails can access this panel
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-[10px] sm:text-xs mt-6 tracking-wide leading-none">
          🔐 Protected Administrator Access Only. Activities are audited.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
