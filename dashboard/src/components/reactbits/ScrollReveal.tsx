'use client';

import React, { useRef, useMemo, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// === Types

export interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
}

// === Component

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  as = 'h2',
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const text: string = typeof children === 'string' ? children : '';

  const splitText = useMemo(() => {
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      return (
        <span className="word inline-block" key={index}>
          {word}
        </span>
      );
    });
  }, [text]);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const wordElements = el.querySelectorAll<HTMLElement>('.word');

      // Reduced motion: the resting state is upright, opaque and unblurred.
      if (prefersReducedMotion()) {
        gsap.set(el, { rotate: 0 });
        gsap.set(wordElements, { opacity: 1, filter: 'blur(0px)' });
        return;
      }

      const scroller = scrollContainerRef?.current ?? window;
      const triggers: ScrollTrigger[] = [];

      const rotationTween = gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            end: rotationEnd,
            scrub: true,
          },
        },
      );
      if (rotationTween.scrollTrigger) triggers.push(rotationTween.scrollTrigger);

      const opacityTween = gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity' },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );
      if (opacityTween.scrollTrigger) triggers.push(opacityTween.scrollTrigger);

      if (enableBlur) {
        const blurTween = gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom-=20%',
              end: wordAnimationEnd,
              scrub: true,
            },
          },
        );
        if (blurTween.scrollTrigger) triggers.push(blurTween.scrollTrigger);
      }

      // Only this instance's triggers are killed, never every trigger on the page.
      return () => triggers.forEach((trigger) => trigger.kill());
    },
    {
      scope: containerRef,
      dependencies: [
        text,
        scrollContainerRef,
        enableBlur,
        baseRotation,
        baseOpacity,
        rotationEnd,
        wordAnimationEnd,
        blurStrength,
      ],
      revertOnUpdate: true,
    },
  );

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={containerRef}
      className={`my-5 text-[clamp(1.6rem,4vw,3rem)] font-semibold leading-[1.5] ${containerClassName} ${textClassName}`.trim()}
    >
      {splitText}
    </Tag>
  );
};

export default ScrollReveal;
