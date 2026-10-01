import { useEffect, useRef } from "react";

/** Controlled ember particles on a single canvas (count capped for performance). */
export default function Embers({ count = 36, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!, ctx = c.getContext("2d")!;
    let w = 0, h = 0, id = 0;
    const size = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    size(); addEventListener("resize", size);
    const mk = () => ({ x: Math.random() * w, y: h + Math.random() * h, r: Math.random() * 1.8 + .4,
      vy: Math.random() * .5 + .2, vx: (Math.random() - .5) * .25, a: Math.random() * .6 + .2, p: Math.random() * 6 });
    const ps = Array.from({ length: count }, mk);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.vy; p.p += .02; p.x += p.vx + Math.sin(p.p) * .2;
        if (p.y < -10) Object.assign(p, mk(), { y: h + 10 });
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(255,170,60,${p.a})`); g.addColorStop(1, "rgba(242,102,10,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.3); ctx.fill();
      }
      id = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(id); removeEventListener("resize", size); };
  }, [count]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
