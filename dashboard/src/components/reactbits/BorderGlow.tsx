'use client';

import React, { useRef, useCallback, useState, useEffect, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (t: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}

// === Helpers

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 154, s: 100, l: 50 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
    })
    .join(', ');
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number): number {
  return x * x * x;
}

/* Returns a cancel function so every pending frame and timer is dropped when
   the component unmounts partway through the intro sweep. */
function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts): () => void {
  let raf = 0;
  let cancelled = false;
  const t0 = performance.now() + delay;

  const tick = (): void => {
    if (cancelled) return;
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else onEnd?.();
  };

  const timer = setTimeout(() => {
    raf = requestAnimationFrame(tick);
  }, delay);

  return () => {
    cancelled = true;
    clearTimeout(timer);
    if (raf) cancelAnimationFrame(raf);
  };
}

const GRADIENT_POSITIONS = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

// === Component

export const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '154 100 50',
  backgroundColor = '#0f0f0f',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#00ff88', '#00cc6a', '#1e1e1e'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [cursorAngle, setCursorAngle] = useState<number>(45);
  const [edgeProximity, setEdgeProximity] = useState<number>(0);
  const [sweepActive, setSweepActive] = useState<boolean>(false);
  const reduced: boolean = usePrefersReducedMotion();

  const getCenterOfElement = useCallback((el: HTMLElement): [number, number] => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number): number => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenterOfElement],
  );

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number): number => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [getCenterOfElement],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setEdgeProximity(getEdgeProximity(card, x, y));
      setCursorAngle(getCursorAngle(card, x, y));
    },
    [getEdgeProximity, getCursorAngle],
  );

  useEffect(() => {
    if (!animated) return;

    // Reduced motion: settle on the resting state instead of sweeping.
    if (reduced) {
      setSweepActive(false);
      setEdgeProximity(0);
      setCursorAngle(45);
      return;
    }

    const angleStart = 110;
    const angleEnd = 465;
    setSweepActive(true);
    setCursorAngle(angleStart);

    const cancels: Array<() => void> = [
      animateValue({ duration: 500, onUpdate: (v) => setEdgeProximity(v / 100) }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (v) => setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart),
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (v) => setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart),
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (v) => setEdgeProximity(v / 100),
        onEnd: () => setSweepActive(false),
      }),
    ];

    return () => cancels.forEach((cancel) => cancel());
  }, [animated, reduced]);

  const colorSensitivity = edgeSensitivity + 20;
  const isVisible = isHovered || sweepActive;
  const borderOpacity = isVisible
    ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity))
    : 0;
  const glowOpacity = isVisible
    ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
    : 0;

  const meshGradients = buildMeshGradients(colors);
  const borderBg = meshGradients.map((g) => `${g} border-box`);
  const fillBg = meshGradients.map((g) => `${g} padding-box`);
  const angleDeg = `${cursorAngle.toFixed(3)}deg`;
  const transition = isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out';

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative isolate grid border ${className}`}
      style={{
        background: backgroundColor,
        borderColor: '#1e1e1e',
        borderRadius: `${borderRadius}px`,
        transform: 'translate3d(0, 0, 0.01px)',
        boxShadow:
          'rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px',
      }}
    >
      {/* mesh gradient border */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[1] rounded-[inherit]"
        style={{
          border: '1px solid transparent',
          background: [
            `linear-gradient(${backgroundColor} 0 100%) padding-box`,
            'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
            ...borderBg,
          ].join(', '),
          opacity: borderOpacity,
          maskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          transition,
        }}
      />

      {/* mesh gradient fill near edges */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[1] rounded-[inherit]"
        style={
          {
            border: '1px solid transparent',
            background: fillBg.join(', '),
            maskImage: [
              'linear-gradient(to bottom, black, black)',
              'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
              'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
              `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(', '),
            WebkitMaskImage: [
              'linear-gradient(to bottom, black, black)',
              'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
              'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
              'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
              `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
            ].join(', '),
            maskComposite: 'subtract, add, add, add, add, add',
            WebkitMaskComposite:
              'source-out, source-over, source-over, source-over, source-over, source-over',
            opacity: borderOpacity * fillOpacity,
            mixBlendMode: 'soft-light',
            transition,
          } as React.CSSProperties
        }
      />

      {/* outer glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-[1] rounded-[inherit]"
        style={
          {
            inset: `${-glowRadius}px`,
            maskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
            opacity: glowOpacity,
            mixBlendMode: 'plus-lighter',
            transition,
          } as React.CSSProperties
        }
      >
        <span
          className="absolute rounded-[inherit]"
          style={{ inset: `${glowRadius}px`, boxShadow: buildBoxShadow(glowColor, glowIntensity) }}
        />
      </span>

      <div className="relative z-[1] flex flex-col overflow-auto">{children}</div>
    </div>
  );
};

export default BorderGlow;
