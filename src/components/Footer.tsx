import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MessageCircle, Heart, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-[#050B18] text-white pt-20 pb-8 border-t border-white/5 relative overflow-hidden">
      {/* Subtle bottom background light */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-burnt/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Left Column: Brand & Tagline */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                <img
                  src="https://res.cloudinary.com/dsqxboxoc/image/upload/v1779522116/WhatsApp_Image_2026-05-23_at_1.10.29_PM_susb5a.jpg"
                  alt="TGPCOP Logo"
                  className="w-full h-full object-cover error-fallback-hide absolute inset-0 transition-transform duration-300 group-hover:scale-108"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <GraduationCap className="w-5 h-5 text-orange-burnt absolute" />
              </div>
              <div>
                <span className="font-display font-extrabold text-xl tracking-tight block leading-none text-white group-hover:text-orange-burnt transition-colors">
                  TGPCOP
                </span>
                <span className="text-[10px] opacity-80 block tracking-widest uppercase font-semibold text-orange-burnt mt-0.5">
                  Student Council
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed font-sans max-w-sm">
              Cultivating the unified academic voice, pharmaceutical innovation, anti-ragging security networks, and campus leadership at Tulsiramji Gaikwad Patil College of Pharmacy, Nagpur.
            </p>
            <blockquote className="border-l-2 border-orange-burnt pl-4 text-white/80 font-display font-medium text-xs sm:text-sm italic leading-relaxed">
              "Your Voice. Our Future. | Together Towards Excellence"
            </blockquote>
          </div>

          {/* Center Column: Quick Navigation Links */}
          <div className="md:col-span-5 space-y-5">
            <h3 className="font-display font-extrabold text-xs uppercase tracking-widest text-gold-accent">
              Quick Resources
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-sm text-white/60">
              {[
                { name: 'Home Portal', path: '/' },
                { name: 'Active Leaders', path: '/council' },
                { name: 'Ask a Question', path: '/ask' },
                { name: 'Notice Board', path: '/notices' },
                { name: 'Events & Sports', path: '/events' },
                { name: 'Gallery Media', path: '/media' },
                { name: '🏆 Achievements', path: '/achievements' },
                { name: '🗳️ Live Voting', path: '/vote' },
                { name: '🤝 Mentorship', path: '/mentors' },
                { name: '📰 Newsletters', path: '/newsletter' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="hover:text-orange-burnt transition-all duration-200 flex items-center space-x-1 hover:translate-x-1"
                  >
                    <ChevronRight className="w-3 h-3 text-orange-burnt/50" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
              <li className="col-span-2 pt-2">
                <Link 
                  to="/complaint" 
                  className="hover:text-red-400 transition-all duration-200 font-bold flex items-center space-x-1 text-red-300 hover:translate-x-1"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-red-400/50 animate-pulse" />
                  <span>🆘 Anonymous Complaint Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Social Connection & Contact Info */}
          <div className="md:col-span-3 space-y-5">
            <h3 className="font-display font-extrabold text-xs uppercase tracking-widest text-gold-accent">
              Campus Location
            </h3>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              TGPCOP Campus, Wardha Road, Mohgaon, Nagpur, Maharashtra 441108
            </p>
            <div className="flex space-x-3.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-orange-burnt hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:scale-108 hover:-translate-y-0.5 shadow-md shadow-black/20"
                aria-label="Instagram Profile"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-orange-burnt hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:scale-108 hover:-translate-y-0.5 shadow-md shadow-black/20"
                aria-label="WhatsApp Channel"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-orange-burnt hover:text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:scale-108 hover:-translate-y-0.5 shadow-md shadow-black/20"
                aria-label="YouTube Channel"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Base Strip */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] sm:text-xs text-white/40 space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-2">
            <span>© {currentYear} TGPCOP Student Council. All Rights Reserved.</span>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/admin" className="hover:text-orange-burnt transition-colors font-semibold tracking-wide flex items-center space-x-0.5">
              <span>🔐</span>
              <span>Portal Console</span>
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/report" className="hover:text-orange-burnt transition-colors font-semibold tracking-wide flex items-center space-x-0.5">
              <span>⚠️</span>
              <span>Report a Bug</span>
            </Link>
          </div>
          <p className="flex items-center space-x-1.5 shrink-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-orange-burnt fill-current animate-pulse" />
            <span>for the pharmacy pioneers of Nagpur.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
