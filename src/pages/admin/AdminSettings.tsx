import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { useRole } from '../../hooks/useRole';
import { useToast } from '../../components/admin/Toast';
import { logActivity } from '../../lib/logs';
import { ProtectedPage } from '../../components/admin/ProtectedPage';
import { 
  Sliders, 
  Upload, 
  ImageIcon, 
  Loader2, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Sun,
  Share2,
  MessageCircle,
  Mail,
  User,
  Trash2,
  Plus
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { email: myEmail } = useAuth();
  const { can } = useRole();
  const toast = useToast();

  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [originalLogo, setOriginalLogo] = useState('');
  const [originalBanner, setOriginalBanner] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<'logo' | 'banner' | 'social' | 'cc_emails' | null>(null);
  const [logoError, setLogoError] = useState('');
  const [bannerError, setBannerError] = useState('');

  // CC Emails Management State
  const [ccEmails, setCcEmails] = useState<Array<{ name: string; email: string }>>([]);
  const [originalCcEmails, setOriginalCcEmails] = useState<Array<{ name: string; email: string }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState({ name: '', email: '' });
  const [ccEmailError, setCcEmailError] = useState('');

  // Social Media Handles State
  const [socialHandles, setSocialHandles] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp_group: '',
  });
  const [originalSocial, setOriginalSocial] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp_group: '',
  });

  const logoImgRef = useRef<HTMLImageElement>(null);
  const bannerImgRef = useRef<HTMLImageElement>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((row: any) => { map[row.key] = row.value; });
      
      setLogoUrl(map['logo_url'] || '');
      setBannerUrl(map['banner_url'] || '');
      setOriginalLogo(map['logo_url'] || '');
      setOriginalBanner(map['banner_url'] || '');

      // Load CC emails
      const ccEmailsData = map['cc_emails'] ? JSON.parse(map['cc_emails']) : [];
      setCcEmails(ccEmailsData);
      setOriginalCcEmails(ccEmailsData);

      // Load social media handles
      const social = {
        instagram: map['social_instagram'] || '',
        facebook: map['social_facebook'] || '',
        twitter: map['social_twitter'] || '',
        linkedin: map['social_linkedin'] || '',
        youtube: map['social_youtube'] || '',
        whatsapp_group: map['social_whatsapp_group'] || '',
      };
      setSocialHandles(social);
      setOriginalSocial(social);
    } catch (err: any) {
      toast.error('❌ Failed to load settings: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Allow empty (uses fallback)
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const saveSetting = async (key: 'logo_url' | 'banner_url', value: string) => {
    if (value && !validateUrl(value)) {
      if (key === 'logo_url') setLogoError('URL must start with https://');
      else setBannerError('URL must start with https://');
      return;
    }
    setLogoError('');
    setBannerError('');
    setIsSaving(key === 'logo_url' ? 'logo' : 'banner');
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      await logActivity(myEmail, key === 'logo_url' ? 'logo_change' : 'banner_change',
        `Updated ${key === 'logo_url' ? 'college logo' : 'homepage banner'} to: "${value}"`);
      if (key === 'logo_url') setOriginalLogo(value);
      else setOriginalBanner(value);
      toast.success(`✅ ${key === 'logo_url' ? 'Logo' : 'Banner'} updated successfully!`);
    } catch (err: any) {
      toast.error(`❌ Failed to save: ${err.message}`);
    } finally {
      setIsSaving(null);
    }
  };

  const saveSocialHandles = async () => {
    setIsSaving('social');
    try {
      const updates = [
        { key: 'social_instagram', value: socialHandles.instagram },
        { key: 'social_facebook', value: socialHandles.facebook },
        { key: 'social_twitter', value: socialHandles.twitter },
        { key: 'social_linkedin', value: socialHandles.linkedin },
        { key: 'social_youtube', value: socialHandles.youtube },
        { key: 'social_whatsapp_group', value: socialHandles.whatsapp_group },
      ].map(item => ({ ...item, updated_at: new Date().toISOString() }));

      const { error } = await supabase.from('settings').upsert(updates);
      if (error) throw error;

      await logActivity(myEmail, 'social_media_update', 'Updated social media handles');
      setOriginalSocial(socialHandles);
      toast.success('✅ Social media handles updated successfully!');
    } catch (err: any) {
      toast.error(`❌ Failed to save: ${err.message}`);
    } finally {
      setIsSaving(null);
    }
  };

  const hasSocialChanges = () => {
    return JSON.stringify(socialHandles) !== JSON.stringify(originalSocial);
  };

  // ─── CC Email Validation & Management ─────────────────────────────────
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateNewEmail = (): boolean => {
    setCcEmailError('');
    
    if (!newEmail.name.trim()) {
      setCcEmailError('Name is required (minimum 2 characters)');
      return false;
    }
    if (newEmail.name.trim().length < 2) {
      setCcEmailError('Name must be at least 2 characters');
      return false;
    }
    if (!newEmail.email.trim()) {
      setCcEmailError('Email is required');
      return false;
    }
    if (!isValidEmail(newEmail.email)) {
      setCcEmailError('Invalid email format');
      return false;
    }
    if (ccEmails.some(e => e.email.toLowerCase() === newEmail.email.toLowerCase())) {
      setCcEmailError('This email is already added');
      return false;
    }
    return true;
  };

  const handleAddEmail = () => {
    if (!validateNewEmail()) return;
    setCcEmails([...ccEmails, { name: newEmail.name.trim(), email: newEmail.email.trim() }]);
    setNewEmail({ name: '', email: '' });
    setShowAddForm(false);
  };

  const handleDeleteEmail = (index: number) => {
    if (ccEmails.length <= 1) {
      toast.error('❌ At least 1 CC email is required');
      return;
    }
    setCcEmails(ccEmails.filter((_, i) => i !== index));
  };

  const saveCcEmails = async () => {
    if (ccEmails.length === 0) {
      toast.error('❌ At least 1 CC email is required');
      return;
    }
    if (ccEmails.length > 10) {
      toast.error('❌ Maximum 10 CC emails allowed');
      return;
    }

    setIsSaving('cc_emails');
    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'cc_emails',
        value: JSON.stringify(ccEmails),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      
      await logActivity(myEmail, 'cc_emails_update', `Updated CC emails to ${ccEmails.length} recipients`);
      setOriginalCcEmails(ccEmails);
      toast.success('✅ CC emails updated successfully!');
    } catch (err: any) {
      toast.error(`❌ Failed to save: ${err.message}`);
    } finally {
      setIsSaving(null);
    }
  };

  const hasCcEmailChanges = () => {
    return JSON.stringify(ccEmails) !== JSON.stringify(originalCcEmails);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-navy-dark/40">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-orange-burnt" />
        <span className="font-display text-sm">Loading branding settings...</span>
      </div>
    );
  }

  return (
    <ProtectedPage 
      hasAccess={can('manage_settings')}
      title="Access Restricted"
      description={'Only the President can manage settings.\nContact president@tgpcop.com'}
    >
      <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">

      {/* Header */}
      <div className="flex items-center space-x-3 bg-white border border-navy-dark/10 p-5 rounded-2xl shadow-xs">
        <div className="w-10 h-10 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-base text-navy-dark">Portal Branding Settings</h3>
          <p className="text-[10px] text-navy-dark/45 font-sans leading-none mt-0.5">
            Change the college logo and homepage banner image displayed on the public website.
          </p>
        </div>
      </div>

      {/* ── College Logo ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-navy-dark/5">
          <ImageIcon className="w-4 h-4 text-orange-burnt" />
          <h4 className="font-display font-bold text-sm text-navy-dark">College Logo</h4>
        </div>

        {/* Preview */}
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-navy-dark/5 border border-navy-dark/10 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img
                ref={logoImgRef}
                src={logoUrl}
                alt="Logo Preview"
                className="w-full h-full object-contain"
                onError={() => setLogoError('Image could not be loaded. Check the URL.')}
                onLoad={() => setLogoError('')}
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-navy-dark/20" />
            )}
          </div>
          <div className="text-xs text-navy-dark/50 font-sans leading-relaxed">
            <p className="font-semibold text-navy-dark/70 mb-1">Current Logo URL:</p>
            {originalLogo ? (
              <a href={originalLogo} target="_blank" rel="noopener noreferrer" className="text-orange-burnt hover:underline flex items-center space-x-1 truncate max-w-xs">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{originalLogo}</span>
              </a>
            ) : (
              <span className="italic text-navy-dark/30">No logo URL set — using default icon</span>
            )}
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
            New Logo URL (must be https://)
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={e => { setLogoUrl(e.target.value); setLogoError(''); }}
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
            className={`w-full px-4 py-2.5 rounded-lg border ${logoError ? 'border-red-400 bg-red-50' : 'border-navy-dark/15 focus:border-orange-burnt'} outline-none text-sm font-sans text-navy-dark transition-colors`}
          />
          {logoError && (
            <p className="text-xs text-red-500 font-medium">{logoError}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => saveSetting('logo_url', logoUrl)}
            disabled={isSaving === 'logo' || logoUrl === originalLogo}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/90 text-white rounded-lg font-display text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-burnt/15"
          >
            {isSaving === 'logo' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></> : <><Check className="w-3.5 h-3.5" /><span>Save Logo</span></>}
          </button>
          <button
            onClick={() => { setLogoUrl(originalLogo); setLogoError(''); }}
            disabled={logoUrl === originalLogo}
            className="flex items-center space-x-1.5 px-4 py-2.5 border border-navy-dark/15 rounded-lg text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Homepage Banner ───────────────────────────────────────────────── */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-navy-dark/5">
          <Sun className="w-4 h-4 text-orange-burnt" />
          <h4 className="font-display font-bold text-sm text-navy-dark">Homepage Hero Banner</h4>
        </div>

        {/* Preview */}
        <div className="w-full h-40 rounded-xl overflow-hidden bg-navy-dark/5 border border-navy-dark/10 flex items-center justify-center relative">
          {bannerUrl ? (
            <img
              ref={bannerImgRef}
              src={bannerUrl}
              alt="Banner Preview"
              className="w-full h-full object-cover"
              onError={() => setBannerError('Image could not be loaded. Check the URL.')}
              onLoad={() => setBannerError('')}
            />
          ) : (
            <div className="text-center text-navy-dark/25">
              <Upload className="w-10 h-10 mx-auto mb-2" />
              <p className="text-xs font-display font-semibold">No banner image set</p>
              <p className="text-[10px] text-navy-dark/20">Paste a Cloudinary URL below</p>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
            Banner Image URL (must be https://)
          </label>
          <input
            type="url"
            value={bannerUrl}
            onChange={e => { setBannerUrl(e.target.value); setBannerError(''); }}
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
            className={`w-full px-4 py-2.5 rounded-lg border ${bannerError ? 'border-red-400 bg-red-50' : 'border-navy-dark/15 focus:border-orange-burnt'} outline-none text-sm font-sans text-navy-dark transition-colors`}
          />
          {bannerError && (
            <p className="text-xs text-red-500 font-medium">{bannerError}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => saveSetting('banner_url', bannerUrl)}
            disabled={isSaving === 'banner' || bannerUrl === originalBanner}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/90 text-white rounded-lg font-display text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-burnt/15"
          >
            {isSaving === 'banner' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></> : <><Check className="w-3.5 h-3.5" /><span>Save Banner</span></>}
          </button>
          <button
            onClick={() => { setBannerUrl(originalBanner); setBannerError(''); }}
            disabled={bannerUrl === originalBanner}
            className="flex items-center space-x-1.5 px-4 py-2.5 border border-navy-dark/15 rounded-lg text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Social Media Handles ──────────────────────────────────────────── */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-navy-dark/5">
          <Share2 className="w-4 h-4 text-orange-burnt" />
          <h4 className="font-display font-bold text-sm text-navy-dark">Social Media Handles</h4>
        </div>

        <p className="text-xs text-navy-dark/50 font-sans leading-relaxed">
          Add your social media profile URLs and WhatsApp group invite link. These will be displayed in the footer and contact sections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Instagram */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <svg className="w-3.5 h-3.5 text-pink-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </label>
            <input
              type="url"
              value={socialHandles.instagram}
              onChange={e => setSocialHandles({ ...socialHandles, instagram: e.target.value })}
              placeholder="https://instagram.com/tgpcop_council"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <svg className="w-3.5 h-3.5 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </label>
            <input
              type="url"
              value={socialHandles.facebook}
              onChange={e => setSocialHandles({ ...socialHandles, facebook: e.target.value })}
              placeholder="https://facebook.com/tgpcop"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <svg className="w-3.5 h-3.5 text-sky-500 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitter / X</span>
            </label>
            <input
              type="url"
              value={socialHandles.twitter}
              onChange={e => setSocialHandles({ ...socialHandles, twitter: e.target.value })}
              placeholder="https://twitter.com/tgpcop_council"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <svg className="w-3.5 h-3.5 text-blue-700 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </label>
            <input
              type="url"
              value={socialHandles.linkedin}
              onChange={e => setSocialHandles({ ...socialHandles, linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/tgpcop"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <svg className="w-3.5 h-3.5 text-red-600 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </label>
            <input
              type="url"
              value={socialHandles.youtube}
              onChange={e => setSocialHandles({ ...socialHandles, youtube: e.target.value })}
              placeholder="https://youtube.com/@tgpcop"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>

          {/* WhatsApp Group */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
              <MessageCircle className="w-3.5 h-3.5 text-green-600" />
              <span>WhatsApp Group</span>
            </label>
            <input
              type="url"
              value={socialHandles.whatsapp_group}
              onChange={e => setSocialHandles({ ...socialHandles, whatsapp_group: e.target.value })}
              placeholder="https://chat.whatsapp.com/invite-link"
              className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-3 border-t border-navy-dark/5">
          <button
            onClick={saveSocialHandles}
            disabled={isSaving === 'social' || !hasSocialChanges()}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/90 text-white rounded-lg font-display text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-burnt/15"
          >
            {isSaving === 'social' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Social Handles</span>
              </>
            )}
          </button>
          <button
            onClick={() => setSocialHandles(originalSocial)}
            disabled={!hasSocialChanges()}
            className="flex items-center space-x-1.5 px-4 py-2.5 border border-navy-dark/15 rounded-lg text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── CC Email Recipients ───────────────────────────────────────────── */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-navy-dark/5">
          <Mail className="w-4 h-4 text-orange-burnt" />
          <h4 className="font-display font-bold text-sm text-navy-dark">CC Email Recipients</h4>
        </div>

        <p className="text-xs text-navy-dark/50 font-sans leading-relaxed">
          These email addresses will receive a copy of every student question and admin reply. Manage who receives notifications from the student council portal.
        </p>

        {/* CC Email List */}
        <div className="space-y-3">
          {ccEmails.length > 0 ? (
            ccEmails.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-navy-dark/3 border border-navy-dark/8 rounded-xl hover:bg-navy-dark/5 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-orange-burnt/15 flex items-center justify-center text-orange-burnt">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm text-navy-dark">{item.name}</p>
                    <p className="text-xs text-navy-dark/50 font-mono">{item.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEmail(index)}
                  disabled={ccEmails.length <= 1 || isSaving === 'cc_emails'}
                  className="p-2 text-navy-dark/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={ccEmails.length <= 1 ? "At least 1 email is required" : "Delete"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-navy-dark/40">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-display">No CC emails added yet</p>
            </div>
          )}
        </div>

        {/* Add New Email Form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={ccEmails.length >= 10}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-orange-burnt/30 rounded-xl text-orange-burnt hover:bg-orange-burnt/5 hover:border-orange-burnt/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-display text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New CC Email</span>
          </button>
        ) : (
          <div className="p-4 bg-orange-burnt/5 border border-orange-burnt/20 rounded-xl space-y-3">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
                Name
              </label>
              <input
                type="text"
                value={newEmail.name}
                onChange={e => { setNewEmail({ ...newEmail, name: e.target.value }); setCcEmailError(''); }}
                placeholder="e.g., Admin, President"
                className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-dark/60">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail.email}
                onChange={e => { setNewEmail({ ...newEmail, email: e.target.value }); setCcEmailError(''); }}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt outline-none text-sm font-sans text-navy-dark transition-colors"
              />
            </div>
            {ccEmailError && (
              <p className="text-xs text-red-500 font-medium">{ccEmailError}</p>
            )}
            <div className="flex items-center space-x-3 pt-2 border-t border-orange-burnt/10">
              <button
                onClick={handleAddEmail}
                className="flex items-center space-x-1.5 px-4 py-2 bg-orange-burnt hover:bg-orange-burnt/90 text-white rounded-lg font-display text-xs font-bold transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
              <button
                onClick={() => { setShowAddForm(false); setCcEmailError(''); }}
                className="flex items-center space-x-1.5 px-4 py-2 border border-navy-dark/15 rounded-lg text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors"
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center space-x-3 pt-3 border-t border-navy-dark/5">
          <button
            onClick={saveCcEmails}
            disabled={isSaving === 'cc_emails' || !hasCcEmailChanges()}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/90 text-white rounded-lg font-display text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-burnt/15"
          >
            {isSaving === 'cc_emails' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            onClick={() => { setCcEmails(originalCcEmails); setShowAddForm(false); setCcEmailError(''); }}
            disabled={!hasCcEmailChanges()}
            className="flex items-center space-x-1.5 px-4 py-2.5 border border-navy-dark/15 rounded-lg text-navy-dark/60 font-display text-xs font-bold hover:bg-navy-dark/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      </div>
    </ProtectedPage>
  );
};

export default AdminSettings;
