'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(useGSAP);

// === Types

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
}

export interface MagicBentoProps {
  cards?: BentoCardProps[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  cardColor?: string;
  borderColor?: string;
  textColor?: string;
  ariaLabel?: string;
}

interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableStars?: boolean;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

// === Constants

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '0, 255, 136';
const MOBILE_BREAKPOINT = 640;

const DEFAULT_CARDS: BentoCardProps[] = [
  { title: 'Analytics', description: 'Track agent behaviour', label: 'Insights' },
  { title: 'Dashboard', description: 'Centralized data view', label: 'Overview' },
  { title: 'Collaboration', description: 'Work together seamlessly', label: 'Teamwork' },
  { title: 'Automation', description: 'Streamline workflows', label: 'Efficiency' },
  { title: 'Integration', description: 'Connect favourite tools', label: 'Connectivity' },
  { title: 'Security', description: 'Policy enforced on chain', label: 'Protection' },
];

// === Helpers

function createParticleElement(x: number, y: number, color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}

function calculateSpotlightValues(radius: number): { proximity: number; fadeDistance: number } {
  return { proximity: radius * 0.5, fadeDistance: radius * 0.75 };
}

function updateCardGlowProperties(
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
): void {
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--glow-x', `${((mouseX - rect.left) / rect.width) * 100}%`);
  card.style.setProperty('--glow-y', `${((mouseY - rect.top) / rect.height) * 100}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
}

// === Hooks

function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// === Card

const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableStars = true,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef<boolean>(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef<boolean>(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback((): void => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor),
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback((): void => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback((): void => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' },
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useGSAP(
    () => {
      const element = cardRef.current;
      if (disableAnimations || !element) return;

      const handleMouseEnter = (): void => {
        isHoveredRef.current = true;
        if (enableStars) animateParticles();

        if (enableTilt) {
          gsap.to(element, {
            rotateX: 5,
            rotateY: 5,
            duration: 0.3,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        }
      };

      const handleMouseLeave = (): void => {
        isHoveredRef.current = false;
        clearAllParticles();

        if (enableTilt) {
          gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
        }
        if (enableMagnetism) {
          gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
        }
      };

      const handleMouseMove = (event: MouseEvent): void => {
        if (!enableTilt && !enableMagnetism) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (enableTilt) {
          gsap.to(element, {
            rotateX: ((y - centerY) / centerY) * -10,
            rotateY: ((x - centerX) / centerX) * 10,
            duration: 0.1,
            ease: 'power2.out',
            transformPerspective: 1000,
          });
        }

        if (enableMagnetism) {
          magnetismAnimationRef.current = gsap.to(element, {
            x: (x - centerX) * 0.05,
            y: (y - centerY) * 0.05,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      };

      const handleClick = (event: MouseEvent): void => {
        if (!clickEffect) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        );

        const ripple = document.createElement('div');
        ripple.setAttribute('aria-hidden', 'true');
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          pointer-events: none;
          z-index: 1000;
        `;

        element.appendChild(ripple);

        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
          },
        );
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('click', handleClick);

      return () => {
        isHoveredRef.current = false;
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('click', handleClick);
        clearAllParticles();
      };
    },
    {
      scope: cardRef,
      dependencies: [
        animateParticles,
        clearAllParticles,
        disableAnimations,
        enableStars,
        enableTilt,
        enableMagnetism,
        clickEffect,
        glowColor,
      ],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={cardRef} className={`${className} relative overflow-hidden`} style={style}>
      {children}
    </div>
  );
};

// === Spotlight

const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (disableAnimations || !gridRef.current || !enabled) return;

      const spotlight = document.createElement('div');
      spotlight.className = 'global-spotlight';
      spotlight.setAttribute('aria-hidden', 'true');
      spotlight.style.cssText = `
        position: fixed;
        width: 800px;
        height: 800px;
        border-radius: 50%;
        pointer-events: none;
        background: radial-gradient(circle,
          rgba(${glowColor}, 0.15) 0%,
          rgba(${glowColor}, 0.08) 15%,
          rgba(${glowColor}, 0.04) 25%,
          rgba(${glowColor}, 0.02) 40%,
          rgba(${glowColor}, 0.01) 65%,
          transparent 70%
        );
        z-index: 200;
        opacity: 0;
        transform: translate(-50%, -50%);
        mix-blend-mode: screen;
      `;
      document.body.appendChild(spotlight);
      spotlightRef.current = spotlight;

      const handleMouseMove = (event: MouseEvent): void => {
        if (!spotlightRef.current || !gridRef.current) return;

        const section = gridRef.current.closest('.bento-section');
        const rect = section?.getBoundingClientRect();
        const mouseInside =
          rect !== undefined &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        const cards = gridRef.current.querySelectorAll<HTMLElement>('.card');

        if (!mouseInside) {
          gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
          cards.forEach((card) => card.style.setProperty('--glow-intensity', '0'));
          return;
        }

        const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
        let minDistance = Infinity;

        cards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const centerX = cardRect.left + cardRect.width / 2;
          const centerY = cardRect.top + cardRect.height / 2;
          const distance =
            Math.hypot(event.clientX - centerX, event.clientY - centerY) -
            Math.max(cardRect.width, cardRect.height) / 2;
          const effectiveDistance = Math.max(0, distance);

          minDistance = Math.min(minDistance, effectiveDistance);

          let glowIntensity = 0;
          if (effectiveDistance <= proximity) {
            glowIntensity = 1;
          } else if (effectiveDistance <= fadeDistance) {
            glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
          }

          updateCardGlowProperties(
            card,
            event.clientX,
            event.clientY,
            glowIntensity,
            spotlightRadius,
          );
        });

        gsap.to(spotlightRef.current, {
          left: event.clientX,
          top: event.clientY,
          duration: 0.1,
          ease: 'power2.out',
        });

        const targetOpacity =
          minDistance <= proximity
            ? 0.8
            : minDistance <= fadeDistance
              ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
              : 0;

        gsap.to(spotlightRef.current, {
          opacity: targetOpacity,
          duration: targetOpacity > 0 ? 0.2 : 0.5,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = (): void => {
        gridRef.current?.querySelectorAll<HTMLElement>('.card').forEach((card) => {
          card.style.setProperty('--glow-intensity', '0');
        });
        if (spotlightRef.current) {
          gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
        spotlightRef.current = null;
      };
    },
    {
      dependencies: [gridRef, disableAnimations, enabled, spotlightRadius, glowColor],
      revertOnUpdate: true,
    },
  );

  return null;
};

// === Component

export const MagicBento: React.FC<MagicBentoProps> = ({
  cards = DEFAULT_CARDS,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  cardColor = '#0f0f0f',
  borderColor = '#1e1e1e',
  textColor = '#e8e8e8',
  ariaLabel = 'Feature highlights',
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isMobile: boolean = useMobileDetection();
  const reduced: boolean = usePrefersReducedMotion();
  const shouldDisableAnimations = disableAnimations || isMobile || reduced;

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
          }

          .card-responsive {
            grid-template-columns: 1fr;
            width: 100%;
            margin: 0 auto;
            padding: 0.5rem;
          }

          .card-responsive .card {
            width: 100%;
            min-height: 180px;
          }

          @media (min-width: 640px) {
            .card-responsive {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .card-responsive {
              grid-template-columns: repeat(4, 1fr);
            }

            .card-responsive .card:nth-child(3) {
              grid-column: span 2;
              grid-row: span 2;
            }

            .card-responsive .card:nth-child(4) {
              grid-column: 1 / span 2;
              grid-row: 2 / span 2;
            }

            .card-responsive .card:nth-child(6) {
              grid-column: 4;
              grid-row: 3;
            }
          }

          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 6px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }

          .card--border-glow:hover {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(${glowColor}, 0.2);
          }

          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(${glowColor}, 0.2);
            border-radius: 50%;
            z-index: -1;
          }

          .text-clamp-1 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .text-clamp-2 {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          @media (prefers-reduced-motion: reduce) {
            .card-responsive .card {
              transition: none;
            }
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <section
        aria-label={ariaLabel}
        className="bento-section relative grid w-full select-none gap-2 p-3"
        style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)' }}
        ref={gridRef}
      >
        <ul className="card-responsive m-0 grid list-none gap-2 p-0">
          {cards.map((card, index) => {
            const cardStyle = {
              backgroundColor: card.color || cardColor,
              borderColor,
              color: textColor,
              '--glow-x': '50%',
              '--glow-y': '50%',
              '--glow-intensity': '0',
              '--glow-radius': '200px',
            } as React.CSSProperties;

            return (
              <li key={card.title ?? index} className="contents">
                <ParticleCard
                  className={`card relative flex aspect-[4/3] w-full max-w-full flex-col justify-between overflow-hidden rounded-[20px] border border-solid p-5 font-light transition-colors duration-300 ease-in-out ${
                    enableBorderGlow ? 'card--border-glow' : ''
                  }`}
                  style={cardStyle}
                  disableAnimations={shouldDisableAnimations}
                  particleCount={particleCount}
                  glowColor={glowColor}
                  enableStars={enableStars}
                  enableTilt={enableTilt}
                  clickEffect={clickEffect}
                  enableMagnetism={enableMagnetism}
                >
                  <div className="card__header relative flex justify-between gap-3">
                    <span className="card__label text-base">{card.label}</span>
                  </div>
                  <div className="card__content relative flex flex-col">
                    <h3
                      className={`card__title m-0 mb-1 text-base font-normal ${textAutoHide ? 'text-clamp-1' : ''}`}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={`card__description text-xs leading-5 opacity-90 ${textAutoHide ? 'text-clamp-2' : ''}`}
                    >
                      {card.description}
                    </p>
                  </div>
                </ParticleCard>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
};

export default MagicBento;
