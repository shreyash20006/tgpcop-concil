import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if mobile device
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Custom hook for Juspay-style scroll animations
 * Handles:
 * - Scroll-triggered fade-up reveals with stagger
 * - Count-up number animations
 * - Pinned scrollytelling sections
 * - Hero entrance animations
 */
export const useGSAPAnimations = () => {
  const animationsInitialized = useRef(false);

  useEffect(() => {
    // Skip if reduced motion is enabled or already initialized
    if (prefersReducedMotion() || animationsInitialized.current) return;

    animationsInitialized.current = true;

    // Clean up function
    const cleanup = () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      animationsInitialized.current = false;
    };

    // 1. Scroll-triggered fade-up reveals with stagger
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: (i % 3) * 0.12, // stagger for cards in a row
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // 2. Count-up number animation
    const statElements = document.querySelectorAll('.stat-count');
    statElements.forEach((stat) => {
      const target = Number((stat as HTMLElement).dataset.target) || 0;
      const suffix = (stat as HTMLElement).dataset.suffix || '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          (stat as HTMLElement).textContent = Math.floor(obj.val).toLocaleString('en-IN') + suffix;
        },
      });
    });

    // 3. Pinned scrollytelling for resource hub (desktop only)
    if (!isMobile()) {
      const pinSection = document.querySelector('.pin-section');
      const pinPanels = document.querySelectorAll('.pin-panel');

      if (pinSection && pinPanels.length > 0) {
        ScrollTrigger.create({
          trigger: pinSection,
          start: 'top top',
          end: `+=${pinPanels.length * 100}%`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(pinPanels.length - 1, Math.floor(self.progress * pinPanels.length));
            pinPanels.forEach((p, i) => {
              p.classList.toggle('active', i === idx);
            });
          },
        });
      }
    }

    // 4. Hero entrance animation
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCTA = document.querySelector('.hero-cta');

    if (heroTitle || heroSubtitle || heroCTA) {
      const tl = gsap.timeline();

      if (heroTitle) {
        tl.from(heroTitle, { opacity: 0, y: 40, duration: 1, ease: 'power3.out' });
      }
      if (heroSubtitle) {
        tl.from(heroSubtitle, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.5');
      }
      if (heroCTA) {
        tl.from(heroCTA, { opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.4');
      }
    }

    return cleanup;
  }, []);
};

/**
 * Hook for infinite marquee animation
 */
export const useMarqueeAnimation = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const track = document.querySelector('.marquee__track');
    if (track) {
      // Duplicate content for seamless loop
      track.innerHTML += track.innerHTML;
    }
  }, []);
};
