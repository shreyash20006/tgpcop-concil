import React, { useState, useEffect } from 'react';
import { ImageIcon, AlertTriangle, Link as LinkIcon, Loader2 } from 'lucide-react';

interface ImageUploadBoxProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setImageError(false);
      setImageLoading(false);
      return;
    }
    setImageError(false);
    setImageLoading(true);
  }, [value]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      {/* 1. Direct Image URL Input Box */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5 flex items-center space-x-1">
          <LinkIcon className="w-3 h-3 text-orange-burnt" />
          <span>Image Destination URL {required && '*'}</span>
        </label>
        <input
          type="url"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste Cloudinary, ImgBB, or unsplash image address link..."
          className="w-full px-3 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm bg-white transition-colors"
        />
        <p className="text-[10px] text-navy-dark/45 mt-1 font-sans">
          Upload your media to Cloudinary/ImgBB, copy the direct image link (.jpg/.png/.webp), and paste it here.
        </p>
      </div>

      {/* 2. Visual Preview Drawer */}
      <div className="border border-dashed border-navy-dark/15 bg-navy-dark/[0.015] rounded-xl h-52 flex flex-col items-center justify-center overflow-hidden relative group">
        
        {/* State A: Loading spinner */}
        {imageLoading && value.trim() && (
          <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center text-navy-dark/60">
            <Loader2 className="w-8 h-8 text-orange-burnt animate-spin mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Loading Live Preview...</span>
          </div>
        )}

        {/* State B: Display URL Image Preview */}
        {value.trim() && !imageError ? (
          <img
            src={value}
            alt="Preview"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : value.trim() && imageError ? (
          /* State C: Render Error Panel */
          <div className="flex flex-col items-center justify-center text-red-500 text-center p-6 space-y-2">
            <AlertTriangle className="w-10 h-10 animate-bounce" />
            <h4 className="font-display font-bold text-xs uppercase tracking-wider">Invalid Image Destination</h4>
            <p className="text-[10px] text-red-500/70 max-w-xs leading-relaxed font-sans">
              Could not resolve image resource. Please ensure you pasted a fully public and direct image link.
            </p>
          </div>
        ) : (
          /* State D: Standard Empty Placeholder */
          <div className="flex flex-col items-center justify-center text-navy-dark/25 text-center p-6 space-y-2">
            <ImageIcon className="w-12 h-12" />
            <h4 className="font-display font-bold text-xs uppercase tracking-widest">Live Image Preview</h4>
            <p className="text-[10px] text-navy-dark/45 max-w-xs leading-relaxed font-sans">
              No address link supplied. A visual preview of your pharmaceutical/campus photo will render here when a valid URL is pasted.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ImageUploadBox;
