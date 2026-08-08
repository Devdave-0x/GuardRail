/** @type {import('tailwindcss').Config} */
module.exports = {
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
        bg: '#0a0a0a',
        'bg-panel': '#0f0f0f',
        'bg-elevated': '#141414',
        'bg-hover': '#1a1a1a',
        border: '#1e1e1e',
        'border-bright': '#2a2a2a',
        green: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a',
          muted: '#00ff8840',
          faint: '#00ff8815',
        },
        blue: {
          DEFAULT: '#0070f3',
          bright: '#3b82f6',
        },
        orange: {
          DEFAULT: '#ff6b35',
          muted: '#ff6b3540',
        },
        red: {
          DEFAULT: '#ff3333',
          muted: '#ff333340',
        },
        yellow: {
          DEFAULT: '#ffd700',
          muted: '#ffd70030',
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
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#7d7d87',
          green: '#00ff88',
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
          'clamp(2rem, 1.2rem + 4vw, 4rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em' },
        ],
        h1: [
          'clamp(1.75rem, 1.1rem + 3.2vw, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        h2: [
          'clamp(1.375rem, 1rem + 1.9vw, 2.25rem)',
          { lineHeight: '1.15', letterSpacing: '-0.01em' },
        ],
        h3: ['clamp(1.125rem, 0.95rem + 0.9vw, 1.5rem)', { lineHeight: '1.25' }],
        lead: ['clamp(0.9375rem, 0.85rem + 0.5vw, 1.125rem)', { lineHeight: '1.6' }],
        body: ['clamp(0.8125rem, 0.78rem + 0.2vw, 0.9375rem)', { lineHeight: '1.65' }],
        caption: ['clamp(0.6875rem, 0.66rem + 0.15vw, 0.8125rem)', { lineHeight: '1.5' }],
        micro: ['clamp(0.625rem, 0.61rem + 0.08vw, 0.6875rem)', { lineHeight: '1.4' }],
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
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: [
          'var(--font-space-grotesk)',
          'Space Grotesk',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      boxShadow: {
        green: '0 0 20px rgba(0, 255, 136, 0.15)',
        cta: '0 0 0 1px rgba(0, 255, 136, 0.25), 0 6px 24px -4px rgba(0, 255, 136, 0.35)',
        'green-sm': '0 0 8px rgba(0, 255, 136, 0.2)',
        panel: '0 1px 0 #1e1e1e, 0 -1px 0 #1e1e1e',
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        scan: 'scan 8s linear infinite',
        blink: 'blink 1.2s step-end infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(0,255,136,0)' },
          '50%': { boxShadow: '0 0 12px rgba(0,255,136,0.4)' },
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
