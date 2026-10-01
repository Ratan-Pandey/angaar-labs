export default function Logo() {
  return (
    <a href="#home" className="group flex items-center gap-3.5" aria-label="The Angaar Labs — home">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface/80 p-1.5 shadow-lift backdrop-blur-md transition-all duration-300 group-hover:border-flame/60 group-hover:shadow-glow">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-flame/20 via-ember/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <svg width="26" height="28" viewBox="0 0 32 36" fill="none" className="relative transition-transform duration-300 group-hover:scale-110" aria-hidden>
          {/* Outer flame shape */}
          <path
            d="M17.5 1.5C21 8.5 30.5 13 30.5 23.5C30.5 29.8 24.5 34.5 16 34.5C7.5 34.5 1.5 29.5 1.5 23.5C1.5 18 5 15 8 15C6.5 19 8.5 21.5 11 21C11.5 16 14.5 10 17.5 1.5Z"
            fill="url(#angaar-flame-grad)"
          />
          {/* Inner core flame tongue */}
          <path
            d="M16 30C19.5 30 22 27.5 22 24C22 19 18 16 16 12C14.5 16 11 19.5 11 24C11 27.5 13 30 16 30Z"
            fill="url(#angaar-core-grad)"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="angaar-flame-grad" x1="16" y1="1.5" x2="16" y2="34.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF2D6" />
              <stop offset="0.2" stopColor="#FFC83B" />
              <stop offset="0.6" stopColor="#FF7A1A" />
              <stop offset="1" stopColor="#FF3700" />
            </linearGradient>
            <linearGradient id="angaar-core-grad" x1="16" y1="12" x2="16" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.4" stopColor="#FFF2D6" />
              <stop offset="1" stopColor="#FFC83B" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-[15px] font-black uppercase tracking-[.18em] text-ink transition-colors duration-300 group-hover:text-flame">
          The Angaar
        </span>
        <span className="font-sans text-[9px] font-bold uppercase tracking-[.48em] text-ember">
          Labs
        </span>
      </div>
    </a>
  );
}

