import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/admin/ProtectedRoute';
import { useToast } from '../../components/admin/Toast';
import { logActivity } from '../../lib/logs';
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
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { email: myEmail } = useAuth();
  const toast = useToast();

  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [originalLogo, setOriginalLogo] = useState('');
  const [originalBanner, setOriginalBanner] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<'logo' | 'banner' | 'social' | null>(null);
  const [logoError, setLogoError] = useState('');
  const [bannerError, setBannerError] = useState('');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-navy-dark/40">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-orange-burnt" />
        <span className="font-display text-sm">Loading branding settings...</span>
      </div>
    );
  }

  return (
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
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
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
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
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
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
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
              <Linkedin className="w-3.5 h-3.5 text-blue-700" />
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
              <Youtube className="w-3.5 h-3.5 text-red-600" />
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

    </div>
  );
};

export default AdminSettings;
