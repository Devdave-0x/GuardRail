'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(useGSAP);

// === Types

export interface BounceCardsProps {
  className?: string;
  images?: string[];
  /* One entry per image. A missing or empty entry marks that image decorative,
     which renders alt="" together with aria-hidden. */
  altTexts?: string[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
  borderColor?: string;
}

// === Helpers

function getNoRotationTransform(transformStr: string): string {
  if (/rotate\([\s\S]*?\)/.test(transformStr)) {
    return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
  }
  if (transformStr === 'none') return 'rotate(0deg)';
  return `${transformStr} rotate(0deg)`;
}

function getPushedTransform(baseTransform: string, offsetX: number): string {
  const translateRegex = /translate\(([-0-9.]+)px\)/;
  const match = baseTransform.match(translateRegex);
  if (match) {
    const newX = parseFloat(match[1]) + offsetX;
    return baseTransform.replace(translateRegex, `translate(${newX}px)`);
  }
  return baseTransform === 'none'
    ? `translate(${offsetX}px)`
    : `${baseTransform} translate(${offsetX}px)`;
}

// === Component

export const BounceCards: React.FC<BounceCardsProps> = ({
  className = '',
  images = [],
  altTexts = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)',
  ],
  enableHover = false,
  borderColor = '#1e1e1e',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced: boolean = usePrefersReducedMotion();

  useGSAP(
    () => {
      // Reduced motion: cards are already at scale 1, so there is nothing to run.
      if (prefersReducedMotion()) {
        gsap.set('.card', { scale: 1 });
        return;
      }

      gsap.fromTo(
        '.card',
        { scale: 0 },
        { scale: 1, stagger: animationStagger, ease: easeType, delay: animationDelay },
      );
    },
    {
      scope: containerRef,
      dependencies: [animationDelay, animationStagger, easeType],
      revertOnUpdate: true,
    },
  );

  const pushSiblings = (hoveredIdx: number): void => {
    if (!enableHover || reduced || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        gsap.to(selector, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto',
        });
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160;
        gsap.to(selector, {
          transform: getPushedTransform(baseTransform, offsetX),
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: Math.abs(hoveredIdx - i) * 0.05,
          overwrite: 'auto',
        });
      }
    });
  };

  const resetSiblings = (): void => {
    if (!enableHover || reduced || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);
      gsap.to(selector, {
        transform: transformStyles[i] || 'none',
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((src, idx) => {
        const alt = altTexts[idx] ?? '';
        const decorative = alt.length === 0;

        return (
          <div
            key={src + idx}
            className={`card card-${idx} absolute aspect-square w-[200px] overflow-hidden rounded-[30px] border-8`}
            style={{
              borderColor,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transform: transformStyles[idx] || 'none',
            }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-full w-full object-cover"
              src={src}
              alt={alt}
              aria-hidden={decorative || undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BounceCards;
