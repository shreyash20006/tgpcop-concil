import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'tgpcop-splash-seen';

interface SplashIntroProps {
  /** Force show even if seen this session (for dev/preview) */
  force?: boolean;
  /** Total duration in ms */
  duration?: number;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({
  force = false,
  duration = 3200,
}) => {
  const [show, setShow] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const forceParam = urlParams.has('splash') || urlParams.get('preview') === 'splash';
    const seen = sessionStorage.getItem(SESSION_KEY);

    if (!seen || force || forceParam) {
      setShow(true);
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem(SESSION_KEY, '1');
        document.body.style.overflow = '';
      }, duration);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [force, duration]);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(SESSION_KEY, '1');
    document.body.style.overflow = '';
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #1b3a8a, #0a1a4d 70%)',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
          data-testid="splash-intro"
        >
          <style>{`
            .tgpcop-logo-box {
              position: relative;
              width: 170px;
              height: 170px;
              display: grid;
              place-items: center;
            }
            .tgpcop-ring {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: conic-gradient(#4a90ff, #ff9a3c, #ffe9b0, #ff9a3c, #4a90ff);
              -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
              mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px));
              animation: tgpcop-spin 3s linear infinite;
            }
            .tgpcop-glow {
              position: absolute;
              inset: -18px;
              border-radius: 50%;
              box-shadow: 0 0 40px rgba(255, 154, 60, 0.35);
              animation: tgpcop-pulse 2.5s ease-in-out infinite;
            }
            .tgpcop-logo {
              width: 100%;
              height: 100%;
              padding: 10px;
              border-radius: 50%;
              object-fit: cover;
              animation: tgpcop-pop 1.2s cubic-bezier(.2, 1.4, .4, 1) both, tgpcop-float 3s 1.4s ease-in-out infinite;
            }
            .tgpcop-fallback {
              width: 100%;
              height: 100%;
              padding: 10px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0d1b3e;
              color: #ffe9b0;
              font-weight: 800;
              font-size: 22px;
              letter-spacing: 0.08em;
              text-shadow: 0 0 16px rgba(255, 154, 60, 0.6);
              border: 2px solid rgba(255, 154, 60, 0.3);
              animation: tgpcop-pop 1.2s cubic-bezier(.2, 1.4, .4, 1) both, tgpcop-float 3s 1.4s ease-in-out infinite;
            }
            .tgpcop-h1 {
              margin: 34px 0 6px;
              font-size: clamp(34px, 9vw, 52px);
              color: #cfe0ff;
              letter-spacing: .02em;
              font-weight: 800;
              line-height: 1.1;
              text-align: center;
              animation: tgpcop-up .9s .6s both;
            }
            .tgpcop-subtitle {
              margin: 0;
              font-size: 12px;
              letter-spacing: .45em;
              color: #f28a1e;
              font-weight: 700;
              text-align: center;
              animation: tgpcop-up .9s .9s both;
            }
            @keyframes tgpcop-spin {
              to { transform: rotate(360deg); }
            }
            @keyframes tgpcop-pulse {
              50% { opacity: .4; transform: scale(1.06); }
            }
            @keyframes tgpcop-pop {
              from { transform: scale(0) rotate(-180deg); opacity: 0; }
              to { transform: none; opacity: 1; }
            }
            @keyframes tgpcop-float {
              50% { transform: translateY(-6px); }
            }
            @keyframes tgpcop-up {
              from { opacity: 0; transform: translateY(14px); }
              to { opacity: 1; transform: none; }
            }
          `}</style>

          {/* Logo container with spinning conic ring and glow */}
          <div className="tgpcop-logo-box">
            <span className="tgpcop-glow" />
            <span className="tgpcop-ring" />
            {!imgFailed ? (
              <img
                className="tgpcop-logo"
                src="/logo.png"
                alt="TGPCOP Logo"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="tgpcop-fallback">
                TGPCOP
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <h1 className="tgpcop-h1">TGPCOP</h1>
          <p className="tgpcop-subtitle">STUDENT COUNCIL</p>

          {/* Skip intro button */}
          <button
            onClick={handleDismiss}
            className="absolute bottom-6 right-6 text-xs text-white/50 hover:text-white font-medium tracking-wider px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;
