import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Embers from "./Embers";

const text = "THE ANGAAR LABS".split("");

/** ~3s cinematic opening: black → embers → flame logo ignites → letters rise → light sweep → curtain lifts. Click/Esc/Enter skips. */
export default function Intro({ onReveal }: { onReveal: () => void }) {
  const [show, setShow] = useState(true);
  const finish = useCallback(() => {
    setShow(false);
    onReveal();
  }, [onReveal]);

  useEffect(() => {
    const t = setTimeout(finish, 3200);
    const k = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && finish();
    addEventListener("keydown", k);
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      clearTimeout(t);
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [finish, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          role="dialog"
          aria-label="The Angaar Labs intro"
          onClick={finish}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-bg"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          >
            <Embers count={32} />
            <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-ember/30 via-flame/20 to-gold/10 blur-[140px]" />
          </motion.div>

          {/* Glowing Flame Symbol */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-flame/40 bg-surface/80 p-3 shadow-glow-lg backdrop-blur-xl">
              <svg width="46" height="50" viewBox="0 0 32 36" fill="none" aria-hidden>
                <path
                  d="M17.5 1.5C21 8.5 30.5 13 30.5 23.5C30.5 29.8 24.5 34.5 16 34.5C7.5 34.5 1.5 29.5 1.5 23.5C1.5 18 5 15 8 15C6.5 19 8.5 21.5 11 21C11.5 16 14.5 10 17.5 1.5Z"
                  fill="url(#intro-flame-grad)"
                />
                <path
                  d="M16 30C19.5 30 22 27.5 22 24C22 19 18 16 16 12C14.5 16 11 19.5 11 24C11 27.5 13 30 16 30Z"
                  fill="#FFFFFF"
                  opacity="0.9"
                />
                <defs>
                  <linearGradient id="intro-flame-grad" x1="16" y1="1.5" x2="16" y2="34.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF2D6" />
                    <stop offset="0.2" stopColor="#FFC83B" />
                    <stop offset="0.6" stopColor="#FF7A1A" />
                    <stop offset="1" stopColor="#FF3700" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          <h1
            className="relative flex flex-wrap justify-center px-6 font-display text-[clamp(2.2rem,8vw,6rem)] font-extrabold tracking-[.14em]"
            aria-label="The Angaar Labs"
          >
            {text.map((ch, i) => (
              <span key={i} className="overflow-hidden py-2" aria-hidden>
                <motion.span
                  className="inline-block"
                  initial={{ y: "115%", filter: "blur(8px)" }}
                  animate={{ y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.6 + i * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {ch === " " ? "\u00A0\u00A0" : ch}
                </motion.span>
              </span>
            ))}
            {/* Ember light sweep */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{
                background:
                  "linear-gradient(100deg,transparent 30%,rgba(255,200,59,.9) 50%,transparent 70%)",
              }}
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ delay: 1.6, duration: 1.1, ease: "easeInOut" }}
            />
          </h1>

          <motion.p
            className="eyebrow absolute bottom-12 !text-muted-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Digital Innovation Studio · Click anywhere to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

