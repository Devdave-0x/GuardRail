'use client';

import { useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface UseSectionRevealOptions {
  /* Selector for the children to stagger, resolved within the returned ref's element. */
  selector?: string;
  distance?: number;
  stagger?: number;
  duration?: number;
  /* Viewport fraction that must be reached before the reveal fires. */
  start?: string;
}

/*
  The scroll-reveal used by every marketing section: children fade and rise in sequence
  as the section enters. GSAP owns scroll-driven motion per docs/Context.md.

  This is the single ScrollTrigger implementation for the marketing route. Sections call
  it and spread the returned ref onto their root; they never build a ScrollTrigger
  themselves, so start points and easing stay identical down the page.
*/
export function useSectionReveal<T extends HTMLElement = HTMLDivElement>({
  selector = '[data-reveal]',
  distance = 24,
  stagger = 0.08,
  duration = 0.7,
  start = 'top 80%',
}: UseSectionRevealOptions = {}): RefObject<T> {
  // useRef<T>(null) yields RefObject<T>, which is what the ref prop accepts.
  const containerRef = useRef<T>(null);
  const prefersReduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const targets = container.querySelectorAll(selector);
      if (targets.length === 0) return;

      // Reduced motion still needs the resting state applied, since the markup ships hidden.
      if (prefersReduced) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power3.out',
          scrollTrigger: { trigger: container, start, once: true },
        },
      );
    },
    {
      scope: containerRef,
      dependencies: [prefersReduced, selector, distance, stagger, duration, start],
    },
  );

  return containerRef;
}
