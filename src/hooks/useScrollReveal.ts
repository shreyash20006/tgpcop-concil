import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Fade-up reveal for any section — usage: const ref = useScrollReveal(); <section ref={ref}> */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useGSAP(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
    items.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    });
  }, { scope: ref });

  return ref;
}
