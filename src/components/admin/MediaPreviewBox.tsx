import React, { useState, useEffect } from 'react';
import { 
  ImageIcon, 
  Video, 
  Music, 
  AlertTriangle, 
  Link as LinkIcon, 
  Loader2 
} from 'lucide-react';
import { getCloudinaryMediaUrl } from '../../lib/cloudinary';

interface MediaPreviewBoxProps {
  mediaType: 'image' | 'video' | 'audio';
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  onValidationError?: (hasError: boolean) => void;
}

export const MediaPreviewBox: React.FC<MediaPreviewBoxProps> = ({
  mediaType,
  value,
  onChange,
  required = false,
  onValidationError,
}) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLoadError(false);
      onValidationError?.(false);
      setIsLoading(false);
      return;
    }

    // 1. Protocol Validation: Must start with https://
    if (!trimmed.toLowerCase().startsWith('https://')) {
      setLoadError(true);
      onValidationError?.(true);
      setIsLoading(false);
      return;
    }

    // 2. Format Validation
    if (mediaType === 'video') {
      const isVideo = trimmed.toLowerCase().includes('.mp4') || 
                      trimmed.toLowerCase().includes('.mov') || 
                      trimmed.toLowerCase().includes('.avi');
      if (!isVideo) {
        setLoadError(true);
        onValidationError?.(true);
        setIsLoading(false);
        return;
      }
    } else if (mediaType === 'audio') {
      const isAudio = trimmed.toLowerCase().includes('.mp3') || 
                      trimmed.toLowerCase().includes('.wav') || 
                      trimmed.toLowerCase().includes('.m4a');
      if (!isAudio) {
        setLoadError(true);
        onValidationError?.(true);
        setIsLoading(false);
        return;
      }
    }

    setLoadError(false);
    onValidationError?.(false);
    setIsLoading(true);
  }, [value, mediaType, onValidationError]);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setLoadError(false);
    onValidationError?.(false);
  };

  const handleLoadError = () => {
    setIsLoading(false);
    setLoadError(true);
    onValidationError?.(true);
  };

  const activeMediaUrl = getCloudinaryMediaUrl(value, mediaType);

  const getMediaIcon = (type: typeof mediaType) => {
    switch (type) {
      case 'video':
        return <Video className="w-12 h-12 text-navy-dark/25" />;
      case 'audio':
        return <Music className="w-12 h-12 text-navy-dark/25" />;
      case 'image':
      default:
        return <ImageIcon className="w-12 h-12 text-navy-dark/25" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Direct Media Destination URL input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5 flex items-center space-x-1">
          <LinkIcon className="w-3 h-3 text-orange-burnt" />
          <span>Cloudinary or Direct Media URL {required && '*'}</span>
        </label>
        <input
          type="url"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste direct ${mediaType} URL address here...`}
          className={`w-full px-3 py-2.5 rounded-lg border focus:ring-1 outline-none text-sm bg-white transition-colors ${
            loadError && value.trim()
              ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/10'
              : 'border-navy-dark/15 focus:border-orange-burnt focus:ring-orange-burnt'
          }`}
        />
        {loadError && value.trim() ? (
          <p className="text-xs text-[#F59E0B] font-sans mt-2 flex items-start space-x-1 font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
            <span>⚠️ Could not load media. Make sure URL is correct Cloudinary link.</span>
          </p>
        ) : (
          <p className="text-[10px] text-navy-dark/45 mt-1 font-sans">
            Upload media to Cloudinary, copy the direct address link (e.g. .jpg, .mp4, .mp3, etc.), and paste here.
          </p>
        )}
      </div>

      {/* 2. Visual Preview Sandbox Container */}
      <div className="border border-dashed border-navy-dark/15 bg-navy-dark/[0.015] rounded-xl min-h-56 flex flex-col items-center justify-center overflow-hidden relative p-4">
        
        {/* Loading skeleton wrapper */}
        {isLoading && value.trim() && (
          <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-6 space-y-4 w-full h-full animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-orange-burnt" />
            </div>
            <div className="h-4 bg-gray-100 rounded-full animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2"></div>
          </div>
        )}

        {/* Dynamic Rendering Preview based on selected media type */}
        {value.trim() && !loadError ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            
            {/* Image Previewer */}
            {mediaType === 'image' && (
              <img
                src={activeMediaUrl}
                alt="Image preview"
                onLoad={handleLoadSuccess}
                onError={handleLoadError}
                className="w-full max-h-48 object-contain rounded-lg shadow-sm"
              />
            )}

            {/* Video Previewer */}
            {mediaType === 'video' && (
              <video
                src={activeMediaUrl}
                controls
                onLoadedData={handleLoadSuccess}
                onError={handleLoadError}
                className="w-full max-h-48 rounded-lg shadow-sm bg-black object-contain"
              />
            )}

            {/* Audio Previewer */}
            {mediaType === 'audio' && (
              <div className="w-full space-y-4 flex flex-col items-center">
                {/* Visual Audio Waveform Monogram */}
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-inner">
                  <Music className="w-8 h-8 animate-pulse" />
                </div>
                <audio
                  src={activeMediaUrl}
                  controls
                  onCanPlay={handleLoadSuccess}
                  onError={handleLoadError}
                  className="w-full max-w-sm"
                />
              </div>
            )}

          </div>
        ) : value.trim() && loadError ? (
          /* Broken Icon Preview */
          <div className="flex flex-col items-center justify-center text-[#F59E0B] text-center space-y-2 p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy-dark">
              ⚠️ Broken Media Link
            </h4>
            <p className="text-[10px] text-navy-dark/45 max-w-xs leading-relaxed font-sans">
              Could not load direct stream. Please check your URL address or make sure it's a correct Cloudinary link.
            </p>
          </div>
        ) : (
          /* Empty placeholder card */
          <div className="flex flex-col items-center justify-center text-navy-dark/25 text-center space-y-2 p-4">
            {getMediaIcon(mediaType)}
            <h4 className="font-display font-bold text-xs uppercase tracking-widest">
              Live {mediaType} Preview
            </h4>
            <p className="text-[10px] text-navy-dark/45 max-w-xs leading-relaxed font-sans">
              Provide a valid link above to render a live, dynamic stream of your published portfolio media.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MediaPreviewBox;
