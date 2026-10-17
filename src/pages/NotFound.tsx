import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Calendar, HelpCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F8FAFC] dark:bg-[#070D1E] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Animated Brand Emblem */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-[-18%] rounded-full border-2 border-dashed border-[#F28A1E]/40 animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-[-8%] rounded-full border border-[#1F7A3A]/30 animate-[spin_8s_linear_infinite_reverse]" />
          
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white dark:bg-[#0D1B3E] p-2.5 shadow-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.jpg"
              alt="TGPCOP Students Council Logo"
              width="120"
              height="120"
              className="w-full h-full object-contain rounded-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://res.cloudinary.com/dzbbqslbe/image/upload/v1773854898/IMG-20261008-WA0059_sq1kox.jpg';
              }}
            />
          </div>
        </div>

        {/* Status & Title */}
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#C84B0E] bg-[#C84B0E]/10 rounded-full border border-[#C84B0E]/20">
            404 Error · Page Missing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable on the TGPCOP Council portal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2A6B] hover:bg-[#081F4D] text-white text-sm font-semibold transition-all shadow-md shadow-[#0B2A6B]/20"
          >
            <Home className="w-4 h-4" />
            <span>Council Home</span>
          </Link>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C84B0E] hover:bg-[#A63D0A] text-white text-sm font-semibold transition-all shadow-md shadow-[#C84B0E]/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Events</span>
          </Link>

          <Link
            to="/ask"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-semibold transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-[#1F7A3A]" />
            <span>Ask Council</span>
          </Link>
        </div>

        {/* Support Note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 pt-6">
          Tulsiramji Gaikwad-Patil College of Pharmacy · Student Council
        </p>
      </div>
    </div>
  );
};

export default NotFound;
