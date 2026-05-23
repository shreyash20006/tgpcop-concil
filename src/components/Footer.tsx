import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MessageCircle, Heart, Instagram, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp_group: '',
  });

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) throw error;
        const map: Record<string, string> = {};
        (data || []).forEach((row: any) => { map[row.key] = row.value; });
        
        setSocialLinks({
          instagram: map['social_instagram'] || '',
          facebook: map['social_facebook'] || '',
          twitter: map['social_twitter'] || '',
          linkedin: map['social_linkedin'] || '',
          youtube: map['social_youtube'] || '',
          whatsapp_group: map['social_whatsapp_group'] || '',
        });
      } catch (err) {
        console.error('Error fetching social links:', err);
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <footer id="footer" className="bg-navy-dark text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Left Column: Brand & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative overflow-hidden w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
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
                <span className="font-display font-bold text-xl tracking-tight block leading-none">
                  TGPCOP
                </span>
                <span className="text-[10px] opacity-75 block tracking-wider uppercase font-semibold">
                  Student Council
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/70 max-w-sm mt-2">
              Tulsiramji Gaikwad Patil College of Pharmacy (TGPCOP), Nagpur.
            </p>
            <blockquote className="text-orange-burnt font-display font-medium text-sm italic">
              "Your Voice. Our Future. | Together Towards Excellence"
            </blockquote>
          </div>

          {/* Center Column: Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base uppercase tracking-wider text-gold-accent">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-3 text-sm text-white/70">
              <li>
                <Link to="/" className="hover:text-orange-burnt transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/council" className="hover:text-orange-burnt transition-colors">Our Council</Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-orange-burnt transition-colors">Ask Council</Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-orange-burnt transition-colors">Notice Board</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-orange-burnt transition-colors">Events & Sports</Link>
              </li>
              <li>
                <Link to="/media" className="hover:text-orange-burnt transition-colors">Gallery Media</Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Social Connection & Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-base uppercase tracking-wider text-gold-accent">
              Connect With Us
            </h3>
            <p className="text-xs text-white/60">
              TGPCOP Campus, Wardha Road, Mohgaon, Nagpur, Maharashtra 441108
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="Facebook Page"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="LinkedIn Page"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              
              {socialLinks.whatsapp_group && (
                <a
                  href={socialLinks.whatsapp_group}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label="WhatsApp Group"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
            
            {/* Fallback message if no social links */}
            {!socialLinks.instagram && !socialLinks.facebook && !socialLinks.twitter && 
             !socialLinks.linkedin && !socialLinks.youtube && !socialLinks.whatsapp_group && (
              <p className="text-xs text-white/40 italic">Social media links coming soon...</p>
            )}
          </div>
        </div>

        {/* Footer Base Strip */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 space-y-4 md:space-y-0">
          <p className="flex flex-wrap items-center gap-2">
            <span>© {currentYear} TGPCOP Student Council. All Rights Reserved.</span>
            <span className="text-white/25 hidden sm:inline">|</span>
            <Link to="/admin" className="hover:text-orange-burnt transition-colors font-semibold tracking-wide">
              🔐 Admin Portal
            </Link>
            <span className="text-white/25 hidden sm:inline">|</span>
            <Link to="/report" className="hover:text-orange-burnt transition-colors font-semibold tracking-wide">
              ⚠️ Report a Problem
            </Link>
          </p>
          <p className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-orange-burnt fill-current" />
            <span>for the pharmacy pioneers at Nagpur.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
