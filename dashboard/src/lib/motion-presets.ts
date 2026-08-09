import type { Transition, Variants } from 'motion/react';

/*
  Shared Motion variants and transitions. Motion owns state-driven and lifecycle motion
  per docs/Context.md; these are the vocabulary for it. Declaring variants inline in each
  component is what produces a UI where every panel eases slightly differently.

  Durations are deliberately short. This is an instrument panel, not a marketing splash,
  and slow easing on live financial data reads as lag rather than polish.
*/

// === Easing and timing

/* cubic-bezier equivalent of GSAP power3.out, so both engines feel like one system. */
export const EASE_OUT: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: readonly [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.5,
} as const;

export const transitionBase: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT,
};

export const transitionSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
};

// === Variants

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitionBase },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE_OUT } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitionSpring },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DURATION.fast } },
};

/* Parent for staggered children. Pair with fadeUp on each child. */
export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/* Transaction rows and queue entries arriving from a poll. */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: transitionBase },
  exit: { opacity: 0, x: 8, transition: { duration: DURATION.fast } },
};

// === Reduced motion

/*
  Collapses any transition to zero duration. Components read the flag from
  usePrefersReducedMotion and pass it here rather than branching at every call site.
*/
export function withReducedMotion(transition: Transition, prefersReduced: boolean): Transition {
  if (!prefersReduced) return transition;
  return { ...transition, duration: 0, delay: 0 };
}
