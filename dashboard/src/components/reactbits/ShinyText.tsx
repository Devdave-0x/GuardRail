'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// === Types

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  delay?: number;
}

interface ShineDriverProps {
  progress: MotionValue<number>;
  speed: number;
  delay: number;
  yoyo: boolean;
  direction: 'left' | 'right';
}

// === Driver

/* Mounted only while the shine should actually run. Keeping the rAF
   subscription inside a conditionally mounted child is what lets reduced
   motion, an offscreen element and a hidden tab avoid the loop entirely. */
const ShineDriver: React.FC<ShineDriverProps> = ({ progress, speed, delay, yoyo, direction }) => {
  const elapsedRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const sign: number = direction === 'left' ? 1 : -1;

  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;

    const cycleDuration = animationDuration + delayDuration;

    if (yoyo) {
      const fullCycle = cycleDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;

      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        progress.set(sign === 1 ? p : 100 - p);
      } else if (cycleTime < cycleDuration) {
        progress.set(sign === 1 ? 100 : 0);
      } else if (cycleTime < cycleDuration + animationDuration) {
        const p = 100 - ((cycleTime - cycleDuration) / animationDuration) * 100;
        progress.set(sign === 1 ? p : 100 - p);
      } else {
        progress.set(sign === 1 ? 0 : 100);
      }
      return;
    }

    const cycleTime = elapsedRef.current % cycleDuration;
    if (cycleTime < animationDuration) {
      const p = (cycleTime / animationDuration) * 100;
      progress.set(sign === 1 ? p : 100 - p);
    } else {
      progress.set(sign === 1 ? 100 : 0);
    }
  });

  return null;
};

// === Component

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#555555',
  shineColor = '#00ff88',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
}) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  const [pageVisible, setPageVisible] = useState<boolean>(true);
  const reduced: boolean = usePrefersReducedMotion();

  const progress = useMotionValue<number>(0);

  useEffect(() => {
    progress.set(0);
  }, [direction, progress]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);

    const onVisibility = (): void => setPageVisible(!document.hidden);
    setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // p=0 puts the shine off the right edge, p=100 off the left.
  const backgroundPosition = useTransform(progress, (p: number) => `${150 - p * 2}% center`);

  const handleMouseEnter = useCallback((): void => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback((): void => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const active = !reduced && !disabled && !isPaused && inView && pageVisible;

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <span className="inline-block">
      {active && (
        <ShineDriver
          progress={progress}
          speed={speed}
          delay={delay}
          yoyo={yoyo}
          direction={direction}
        />
      )}

      {/* The gradient clip makes the visual text unreliable for assistive tech. */}
      <motion.span
        ref={spanRef}
        aria-hidden="true"
        className={`inline-block ${className}`}
        style={{ ...gradientStyle, backgroundPosition }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </motion.span>

      <span className="sr-only">{text}</span>
    </span>
  );
};

export default ShinyText;
