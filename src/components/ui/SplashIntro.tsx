import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'tgpcop-splash-seen';
const PRIMARY_LOGO = '/logo.jpg';
const FALLBACK_LOGO =
  'https://res.cloudinary.com/icgawsqe/image/upload/v1791987344/IMG-20261008-WA0059.jpg';

interface SplashIntroProps {
  /** Force show even if seen this session (for dev/preview) */
  force?: boolean;
  /** Total duration in ms (default 5000ms per 5-second motion graphic spec) */
  duration?: number;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({
  force = false,
  duration = 5000,
}) => {
  const [show, setShow] = useState(false);
  const [logoSrc, setLogoSrc] = useState(PRIMARY_LOGO);

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

  const dots = [
    { color: '#0b2a6b', angle: 0, r: 150, dur: 5 },
    { color: '#1f7a3a', angle: 40, r: 164, dur: 7 },
    { color: '#f28a1e', angle: 80, r: 178, dur: 9 },
    { color: '#0b2a6b', angle: 120, r: 150, dur: 5 },
    { color: '#1f7a3a', angle: 160, r: 164, dur: 7 },
    { color: '#f28a1e', angle: 200, r: 178, dur: 9 },
    { color: '#0b2a6b', angle: 240, r: 150, dur: 5 },
    { color: '#1f7a3a', angle: 280, r: 164, dur: 7 },
    { color: '#f28a1e', angle: 320, r: 178, dur: 9 },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #dfeaf8 75%, #cedef2 100%)',
            color: '#0b2a6b',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
          data-testid="splash-intro"
        >
          {/* Subtle corporate motion graphic stage (16:9 responsive frame) */}
          <div className="relative w-[min(80vw,340px)] aspect-[400/430] flex items-center justify-center">
            {/* Outer rotating tricolor ring 1 */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                inset: '-14%',
                border: '3px solid transparent',
                borderTopColor: '#f28a1e',
                borderRightColor: '#1f7a3a',
                borderBottomColor: '#0b2a6b',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{
                opacity: { duration: 1, delay: 0.2 },
                rotate: { duration: 3, ease: 'linear', repeat: Infinity },
              }}
            />

            {/* Outer rotating ring 2 (reverse) */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                inset: '-24%',
                border: '2px solid transparent',
                borderTopColor: '#0b2a6b',
                borderRightColor: '#f28a1e',
                borderBottomColor: '#1f7a3a',
                opacity: 0.5,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5, rotate: -360 }}
              transition={{
                opacity: { duration: 1, delay: 0.5 },
                rotate: { duration: 5, ease: 'linear', repeat: Infinity },
              }}
            />

            {/* Orbiting glowing dots */}
            <div className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none">
              {dots.map((dot, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    background: dot.color,
                    boxShadow: `0 0 10px ${dot.color}90`,
                  }}
                  animate={{
                    rotate: [dot.angle, dot.angle + 360],
                  }}
                  transition={{
                    duration: dot.dur,
                    ease: 'linear',
                    repeat: Infinity,
                  }}
                  initial={{
                    transformOrigin: '0 0',
                    translateX: dot.r,
                    translateY: -4,
                  }}
                />
              ))}
            </div>

            {/* Official circular college emblem */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              initial={{ scale: 0, rotate: -200, opacity: 0 }}
              animate={{
                scale: [0, 1.08, 1, 1.03, 1, 1.06],
                rotate: 0,
                opacity: 1,
                y: [0, -6, 0, -4, 0],
              }}
              transition={{
                scale: { duration: 4.8, times: [0, 0.35, 0.48, 0.72, 0.88, 1], ease: 'easeInOut' },
                rotate: { duration: 1.6, ease: [0.2, 1.4, 0.4, 1] },
                opacity: { duration: 0.6 },
                y: { duration: 3.2, delay: 1.8, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{
                filter: 'drop-shadow(0 14px 28px rgba(11,42,107,0.32))',
              }}
            >
              <img
                src={logoSrc}
                alt="TGPCOP Students Council logo"
                className="w-full h-full object-contain"
                style={{ clipPath: 'circle(48% at 50% 50%)' }}
                loading="eager"
                onError={() => {
                  if (logoSrc !== FALLBACK_LOGO) {
                    setLogoSrc(FALLBACK_LOGO);
                  }
                }}
              />

              {/* Light shine sweep effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: 'circle(48% at 50% 50%)',
                  background:
                    'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%)',
                  backgroundSize: '250% 100%',
                }}
                initial={{ backgroundPosition: '150% 0' }}
                animate={{ backgroundPosition: ['150% 0', '-50% 0', '-50% 0'] }}
                transition={{
                  duration: 3,
                  delay: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease: 'easeOut' }}
            className="mt-8 mb-2 font-display font-extrabold tracking-tight text-center"
            style={{
              fontSize: 'clamp(20px, 5.5vw, 32px)',
              color: '#0b2a6b',
              letterSpacing: '0.04em',
            }}
          >
            TGPCOP STUDENTS COUNCIL
          </motion.h1>

          {/* Tagline: LEAD · LEARN · INSPIRE */}
          <div className="flex gap-3 font-bold tracking-[0.2em] uppercase text-xs sm:text-sm mt-1">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.6 }}
              style={{ color: '#0b2a6b' }}
            >
              LEAD
            </motion.span>
            <span style={{ color: '#0b2a6b40' }}>·</span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
              style={{ color: '#1f7a3a' }}
            >
              LEARN
            </motion.span>
            <span style={{ color: '#0b2a6b40' }}>·</span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.6 }}
              style={{ color: '#f28a1e' }}
            >
              INSPIRE
            </motion.span>
          </div>

          {/* Loading bar progression */}
          <div className="w-48 h-1 bg-[#0b2a6b]/10 rounded-full overflow-hidden mt-6">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0b2a6b] via-[#1f7a3a] to-[#f28a1e] rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 4.2, delay: 0.6, ease: 'easeInOut' }}
            />
          </div>

          {/* Quick Skip button in corner for convenience */}
          <button
            onClick={handleDismiss}
            className="absolute bottom-6 right-6 text-xs text-[#0b2a6b]/60 hover:text-[#0b2a6b] font-medium tracking-wider px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-[#0b2a6b]/15 transition-all shadow-sm cursor-pointer"
          >
            Skip Intro →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;
