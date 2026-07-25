import { useRef } from "react";

export default function TiltCard({ children, className = "" }: {
  children: React.ReactNode; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(900px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateY(-6px) scale(1.02)`;
    // Shine follow effect
    el.style.setProperty("--shine-x", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--shine-y", `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(900px) rotateY(0) rotateX(0) translateY(0) scale(1)";
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
         className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}
