import type { Accent, AccentClasses } from '@/types';

// === Accents

/*
  Semantic accent palette for icons and cards.

  Every class string here is written out in full. Tailwind scans source text, so a
  constructed name like `text-${accent}` would be purged from the stylesheet and the
  colour would silently vanish in production. Never build these by interpolation.

  `glow` is a raw rgba rather than a class because it feeds --edge-glow-color, which the
  cursor-tracking border reads as a CSS custom property.
*/
export const ACCENTS: Record<Accent, AccentClasses> = {
  green: {
    text: 'text-green',
    border: 'border-green/40',
    bg: 'bg-green/10',
    glow: 'rgba(0, 255, 136, 0.6)',
  },
  blue: {
    text: 'text-blue-bright',
    border: 'border-blue-bright/40',
    bg: 'bg-blue-bright/10',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
  cyan: {
    text: 'text-cyan',
    border: 'border-cyan/40',
    bg: 'bg-cyan/10',
    glow: 'rgba(34, 211, 238, 0.6)',
  },
  violet: {
    text: 'text-violet',
    border: 'border-violet/40',
    bg: 'bg-violet/10',
    glow: 'rgba(167, 139, 250, 0.6)',
  },
  pink: {
    text: 'text-pink',
    border: 'border-pink/40',
    bg: 'bg-pink/10',
    glow: 'rgba(244, 114, 182, 0.6)',
  },
  orange: {
    text: 'text-orange',
    border: 'border-orange/40',
    bg: 'bg-orange/10',
    glow: 'rgba(255, 107, 53, 0.6)',
  },
  red: {
    text: 'text-red',
    border: 'border-red/40',
    bg: 'bg-red/10',
    glow: 'rgba(255, 51, 51, 0.6)',
  },
  yellow: {
    text: 'text-yellow',
    border: 'border-yellow/40',
    bg: 'bg-yellow/10',
    glow: 'rgba(255, 215, 0, 0.6)',
  },
};

/*
  Accent by meaning, not by position. Reads are green, writes are blue, money movement is
  cyan, inspection is violet, scheduling is yellow, and anything protective is orange.
  Keeping this mapping in one place is what stops the palette drifting into decoration.
*/
export function accentFor(accent: Accent): AccentClasses {
  return ACCENTS[accent];
}
