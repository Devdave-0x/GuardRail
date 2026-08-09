/*
  Builds a Tailwind color value that can carry an opacity modifier (`bg-green/10`) on top
  of a CSS custom property. A plain `var(--green)` can't take `/NN` — Tailwind needs to
  inject the alpha itself, which means it needs the color as separate `R G B` channels
  (the `-rgb` variables in globals.css), not a hex string it can't unpack. Falls back to
  `defaultOpacity` for the bare `muted`/`faint`-style tokens, which are always meant to be
  translucent rather than opacity-modified at the call site.
*/
function withOpacity(rgbVariable, defaultOpacity = 1) {
  // CSS Color 4 slash syntax, not `rgba(var(--x-rgb), N)` — the -rgb custom properties are
  // a space-separated triplet ("0 255 136"), and substituting that into legacy comma-syntax
  // rgba() produces `rgba(0 255 136, .4)`, which is invalid CSS. An invalid value doesn't
  // fall back to the hex color, it drops the whole declaration, so the browser used
  // whatever `border-color` cascaded from underneath — Tailwind preflight's `currentColor` —
  // which is why every accent border/bg was silently rendering as bright white instead of
  // its actual color.
  return ({ opacityValue }) => `rgb(var(${rgbVariable}) / ${opacityValue ?? defaultOpacity})`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    // Only two breakpoints by design. `md` is deliberately absent so it cannot be
    // used by accident: see docs/Context.md. Reach for `sm` or `lg` instead.
    screens: {
      sm: '640px',
      lg: '1024px',
    },
    extend: {
      maxWidth: {
        // Single shared page width for both route groups. Never write max-w-[1600px].
        container: '1600px',
        /*
          Ceiling for the hero render. The plate is a 1254px square, and past this it
          overpowers the headline beside it and pushes the CTA below the fold on short
          laptop viewports.
        */
        'hero-art': '550px',
      },
      /*
        Spacing tokens back onto CSS variables defined in globals.css, which shift at the
        sm and lg breakpoints. That makes `px-section-px` responsive on its own, so call
        sites never repeat a px-4 sm:px-6 lg:px-8 ladder. The -tight and -loose suffixes
        are rhythm scales, not breakpoints.
      */
      spacing: {
        'section-px': 'var(--section-px)',
        'section-py': 'var(--section-py)',
        'section-py-tight': 'var(--section-py-tight)',
        'section-py-loose': 'var(--section-py-loose)',
        'panel-gap': 'var(--panel-gap)',
        'stack-gap': 'var(--stack-gap)',
      },
      colors: {
        bg: withOpacity('--bg-rgb'),
        'bg-panel': withOpacity('--bg-panel-rgb'),
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        border: withOpacity('--border-rgb'),
        'border-bright': 'var(--border-bright)',
        green: {
          DEFAULT: withOpacity('--green-rgb'),
          dim: 'var(--green-dim)',
          muted: withOpacity('--green-rgb', 0.25),
          faint: withOpacity('--green-rgb', 0.08),
        },
        blue: {
          DEFAULT: withOpacity('--blue-rgb'),
          bright: withOpacity('--blue-bright-rgb'),
        },
        orange: {
          DEFAULT: withOpacity('--orange-rgb'),
          muted: withOpacity('--orange-rgb', 0.25),
        },
        red: {
          DEFAULT: withOpacity('--red-rgb'),
          muted: withOpacity('--red-rgb', 0.25),
        },
        yellow: {
          DEFAULT: withOpacity('--yellow-rgb'),
          muted: withOpacity('--yellow-rgb', 0.19),
        },
        /*
          Extra accent hues so a set of sibling icons can each carry their own colour
          instead of a uniform green. Chosen to stay legible on #0a0a0a alongside the
          existing green, blue, orange, red, and yellow. See src/lib/accents.ts, which is
          the only place these are mapped to meaning.
        */
        cyan: {
          DEFAULT: '#22d3ee',
        },
        violet: {
          DEFAULT: '#a78bfa',
        },
        pink: {
          DEFAULT: '#f472b6',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          green: 'var(--green)',
        },
        /*
          Never flips with the theme — see --fixed-light in globals.css. Only for text
          sitting directly on the hero video, which is always dark regardless of theme.
          Everything else on a themed background should use `text-*` above instead.
        */
        fixed: {
          light: withOpacity('--fixed-light-rgb'),
        },
      },
      /*
        Fluid type scale. Each entry is [size, { lineHeight, letterSpacing }] and uses
        clamp(), so `text-display` is already responsive and replaces ladders like
        `text-3xl sm:text-5xl lg:text-6xl` at every call site.

        These are canonical utilities, not arbitrary values. Changing a heading size
        across the whole site is a one-line edit here. The clamp middle term is in vw so
        it scales continuously rather than stepping at the two breakpoints.
      */
      fontSize: {
        display: [
          'clamp(2.25rem, 1.3rem + 4.2vw, 4.25rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em' },
        ],
        h1: [
          'clamp(1.875rem, 1.15rem + 3.4vw, 3.25rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        h2: [
          'clamp(1.5rem, 1.05rem + 2vw, 2.5rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em' },
        ],
        h3: ['clamp(1.25rem, 1rem + 1vw, 1.625rem)', { lineHeight: '1.25' }],
        lead: ['clamp(1rem, 0.9rem + 0.55vw, 1.25rem)', { lineHeight: '1.6' }],
        body: ['clamp(0.875rem, 0.82rem + 0.22vw, 1rem)', { lineHeight: '1.65' }],
        caption: ['clamp(0.75rem, 0.7rem + 0.17vw, 0.875rem)', { lineHeight: '1.5' }],
        micro: ['clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem)', { lineHeight: '1.4' }],
      },
      height: {
        /* Fixed scroll height for the agent chat log. */
        'chat-log': '26.25rem',
      },
      letterSpacing: {
        /* The wordmark's wide spacing, matching the logo artwork. */
        logo: '0.2em',
      },
      fontFamily: {
        mono: [
          'var(--font-jetbrains-mono)',
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
        sans: [
          'var(--font-hanken-grotesk)',
          'Hanken Grotesk',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        serif: ['var(--font-serif)', 'Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        green: '0 0 20px rgba(0, 255, 136, 0.15)',
        cta: '0 0 0 1px rgba(0, 255, 136, 0.25), 0 6px 24px -4px rgba(0, 255, 136, 0.35)',
        'green-sm': '0 0 8px rgba(0, 255, 136, 0.2)',
        panel: '0 1px 0 #1e1e1e, 0 -1px 0 #1e1e1e',
        nav: 'var(--shadow-nav)',
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        scan: 'scan 8s linear infinite',
        blink: 'blink 1.2s step-end infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        /*
          Dashboard panel mount reveal.

          CSS rather than Motion, which section 5 would otherwise assign this. Motion
          leaves a `transform` on the element after the animation settles, and any
          transformed ancestor re-bases the `background-attachment: fixed` inside
          `.edge-glow`, so every panel's cursor glow would drift out of alignment with
          the pointer. A keyframe that ends at `transform: none` leaves no such trace.

          `backwards` holds the from-state through the stagger delay. Without it a panel
          renders at full opacity, then blinks out when its delay elapses.
        */
        'panel-in': 'panel-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        /*
          Slow drift for the hero art. The render is a still, and a plate that never moves
          next to an animated ambient background reads as a failed asset load. This is the
          smallest amount of life that fixes that without becoming a gimmick.
        */
        'art-float': 'art-float 9s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(0,255,136,0)' },
          '50%': { boxShadow: '0 0 12px rgba(0,255,136,0.4)' },
        },
        'panel-in': {
          from: { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'art-float': {
          from: { transform: 'translate3d(0, -0.5%, 0)' },
          to: { transform: 'translate3d(0, 1.5%, 0)' },
        },
        scan: {
          '0%': { backgroundPosition: '0 -100%' },
          '100%': { backgroundPosition: '0 200%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
