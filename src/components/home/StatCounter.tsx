import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type Props = { target: number; suffix?: string; label: string };

export default function StatCounter({ target, suffix = "", label }: Props) {
  const numRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!numRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: { trigger: numRef.current, start: "top 90%", once: true },
      onUpdate: () => {
        if (numRef.current)
          numRef.current.textContent =
            Math.floor(obj.val).toLocaleString("en-IN") + suffix;
      },
    });
  });

  return (
    <div className="stat-block">
      <h3 ref={numRef}>0</h3>
      <p>{label}</p>
    </div>
  );
}
