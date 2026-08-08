'use client';

import React, { useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

interface Position {
  x: number;
  y: number;
}

export interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

// === Component

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(0, 255, 136, 0.15)',
  backgroundColor = '#0f0f0f',
  borderColor = '#1e1e1e',
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const reduced: boolean = usePrefersReducedMotion();

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handleFocus = (): void => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={() => setOpacity(0.6)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl border p-8 ${className}`}
      style={{ backgroundColor, borderColor }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity,
          // Reduced motion keeps the highlight but drops the fade.
          transition: reduced ? 'none' : 'opacity 500ms ease-in-out',
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
