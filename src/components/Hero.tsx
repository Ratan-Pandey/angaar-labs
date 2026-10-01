import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal, Flame } from "lucide-react";

const lines = [
  ["We", "forge"],
  ["digital", "realms"],
  ["that", "burn", "bright."],
];
const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero({ ready }: { ready: boolean }) {
  const fade = (d: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { delay: d, duration: 0.9, ease },
  });

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col justify-between pb-12 pt-32 md:pt-40">
      <div className="shell relative z-10 my-auto">
        {/* Live Status Pill */}
        <motion.div {...fade(0.4)} className="mb-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-flame/30 bg-surface/70 px-4 py-1.5 text-xs font-semibold text-ink backdrop-blur-md shadow-glass">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="text-muted-light">The Angaar Labs</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-bold text-flame">3D Web & Creative Engineering</span>
          </div>
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted sm:inline-flex">
            <Sparkles size={13} className="text-gold" /> Studio Portfolio
          </span>
        </motion.div>

        {/* Main Title with Staggered Word Reveal */}
        <h1 className="h-display max-w-3xl lg:max-w-[58%] text-[clamp(3rem,8vw,7.5rem)] leading-[0.92]">
          {lines.map((ln, li) => (
            <span key={li} className={`block ${li === 2 ? "ember-text" : ""}`}>
              {ln.map((w, wi) => (
                <span key={w} className="mr-[.22em] inline-block overflow-hidden pb-[.08em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "115%" }}
                    animate={ready ? { y: 0 } : {}}
                    transition={{ delay: 0.5 + (li * 2 + wi) * 0.08, duration: 1.1, ease }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subtitle with High-Impact Value Proposition */}
        <motion.p
          {...fade(1.1)}
          className="mt-8 max-w-lg text-base leading-relaxed text-muted-light md:text-lg"
        >
          We architect immersive, custom-coded 3D web experiences, bespoke digital products, and high-conversion brand identities that dominate attention.
        </motion.p>

        {/* Action Buttons with Glowing Flame Accents */}
        <motion.div {...fade(1.3)} className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
          <a href="#contact" className="btn btn-primary group !px-8 !py-4 text-base">
            <span>Ignite a Project</span>
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a href="#work" className="btn btn-ghost !px-7 !py-4 text-base">
            <Flame size={17} className="text-flame" />
            <span>Explore Showcase</span>
          </a>
        </motion.div>

        {/* Capability Tags */}
        <motion.div {...fade(1.5)} className="mt-12 flex flex-wrap items-center gap-2.5">
          {[
            "✦ Custom Three.js / WebGL",
            "✦ High-Performance Architecture",
            "✦ Awwwards-Tier Design",
            "✦ Bespoke Identity",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-surface/40 px-3.5 py-1 text-[11px] font-medium text-muted backdrop-blur-sm transition-colors hover:border-flame/40 hover:text-ink"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="shell relative z-10 mt-12">
        <motion.div
          {...fade(1.7)}
          className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-surface/60 p-5 backdrop-blur-md md:grid-cols-4 md:gap-8"
        >
          {[
            { label: "Design Direction", val: "Aesthetic Mastery" },
            { label: "Code Craft", val: "100% Bespoke Zero-Bloat" },
            { label: "Frame Rate", val: "Fluid 60+ FPS WebGL" },
            { label: "Impact", val: "Global Conversion" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                {item.label}
              </span>
              <span className="mt-1 font-display text-sm font-bold text-ink md:text-base">
                {item.val}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

