'use client';

import React, { useEffect, useRef, memo } from 'react';
import { prefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const TWO_PI = Math.PI * 2;

// === Types

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface DotFieldSettings {
  dotRadius: number;
  dotSpacing: number;
  cursorRadius: number;
  cursorForce: number;
  bulgeOnly: boolean;
  bulgeStrength: number;
  sparkle: boolean;
  waveAmplitude: number;
  gradientFrom: string;
  gradientTo: string;
}

export interface DotFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
}

// === Component

export const DotField = memo<DotFieldProps>(
  ({
    dotRadius = 1.5,
    dotSpacing = 14,
    cursorRadius = 500,
    cursorForce = 0.1,
    bulgeOnly = true,
    bulgeStrength = 67,
    glowRadius = 160,
    sparkle = false,
    waveAmplitude = 0,
    gradientFrom = 'rgba(0, 255, 136, 0.35)',
    gradientTo = 'rgba(0, 204, 106, 0.15)',
    glowColor = '#00ff88',
    className = '',
    ...rest
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glowRef = useRef<SVGCircleElement | null>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
    const rafRef = useRef<number>(0);
    const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
    const glowOpacity = useRef<number>(0);
    const engagement = useRef<number>(0);
    const rebuildRef = useRef<(() => void) | null>(null);
    const glowIdRef = useRef<string>(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);

    const settingsRef = useRef<DotFieldSettings>({
      dotRadius,
      dotSpacing,
      cursorRadius,
      cursorForce,
      bulgeOnly,
      bulgeStrength,
      sparkle,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    });
    settingsRef.current = {
      dotRadius,
      dotSpacing,
      cursorRadius,
      cursorForce,
      bulgeOnly,
      bulgeStrength,
      sparkle,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      const glowEl = glowRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const reduced = prefersReducedMotion();
      let resizeTimer: ReturnType<typeof setTimeout>;

      const buildDots = (w: number, h: number): void => {
        const p = settingsRef.current;
        const step = p.dotRadius + p.dotSpacing;
        const cols = Math.floor(w / step);
        const rows = Math.floor(h / step);
        const padX = (w % step) / 2;
        const padY = (h % step) / 2;
        const dots: Dot[] = new Array(Math.max(rows * cols, 0));
        let idx = 0;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const ax = padX + col * step + step / 2;
            const ay = padY + row * step + step / 2;
            dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
          }
        }
        dotsRef.current = dots;
      };

      const doResize = (): void => {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        sizeRef.current = {
          w,
          h,
          offsetX: rect.left + window.scrollX,
          offsetY: rect.top + window.scrollY,
        };
        buildDots(w, h);
        if (reduced) draw();
      };

      const resize = (): void => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(doResize, 100);
      };

      const onMouseMove = (event: MouseEvent): void => {
        const s = sizeRef.current;
        mouseRef.current.x = event.pageX - s.offsetX;
        mouseRef.current.y = event.pageY - s.offsetY;
      };

      const updateMouseSpeed = (): void => {
        const m = mouseRef.current;
        const dx = m.prevX - m.x;
        const dy = m.prevY - m.y;
        m.speed += (Math.sqrt(dx * dx + dy * dy) - m.speed) * 0.5;
        if (m.speed < 0.001) m.speed = 0;
        m.prevX = m.x;
        m.prevY = m.y;
      };

      let frameCount = 0;

      function draw(): void {
        const dots = dotsRef.current;
        const m = mouseRef.current;
        const { w, h } = sizeRef.current;
        const p = settingsRef.current;
        const len = dots.length;
        const t = frameCount * 0.02;

        const targetEngagement = Math.min(m.speed / 5, 1);
        engagement.current += (targetEngagement - engagement.current) * 0.06;
        if (engagement.current < 0.001) engagement.current = 0;
        const eng = engagement.current;

        glowOpacity.current += (eng - glowOpacity.current) * 0.08;

        if (glowEl) {
          glowEl.setAttribute('cx', String(m.x));
          glowEl.setAttribute('cy', String(m.y));
          glowEl.style.opacity = String(glowOpacity.current);
        }

        ctx!.clearRect(0, 0, w, h);

        const grad = ctx!.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, p.gradientFrom);
        grad.addColorStop(1, p.gradientTo);
        ctx!.fillStyle = grad;

        const cr = p.cursorRadius;
        const crSq = cr * cr;
        const rad = p.dotRadius / 2;
        const isBulge = p.bulgeOnly;

        ctx!.beginPath();

        for (let i = 0; i < len; i++) {
          const d = dots[i];
          const dx = m.x - d.ax;
          const dy = m.y - d.ay;
          const distSq = dx * dx + dy * dy;

          if (distSq < crSq && eng > 0.01) {
            const dist = Math.sqrt(distSq);
            const angle = Math.atan2(dy, dx);
            if (isBulge) {
              const falloff = 1 - dist / cr;
              const push = falloff * falloff * p.bulgeStrength * eng;
              d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
              d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
            } else {
              const move = (500 / dist) * (m.speed * p.cursorForce);
              d.vx += Math.cos(angle) * -move;
              d.vy += Math.sin(angle) * -move;
            }
          } else if (isBulge) {
            d.sx += (d.ax - d.sx) * 0.1;
            d.sy += (d.ay - d.sy) * 0.1;
          }

          if (!isBulge) {
            d.vx *= 0.9;
            d.vy *= 0.9;
            d.x = d.ax + d.vx;
            d.y = d.ay + d.vy;
            d.sx += (d.x - d.sx) * 0.1;
            d.sy += (d.y - d.sy) * 0.1;
          }

          let drawX = d.sx;
          let drawY = d.sy;
          if (p.waveAmplitude > 0) {
            drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
            drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
          }

          let r = rad;
          if (p.sparkle) {
            const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
            if (hash % 100 < 3) r = rad * 1.8;
          }

          ctx!.moveTo(drawX + r, drawY);
          ctx!.arc(drawX, drawY, r, 0, TWO_PI);
        }

        ctx!.fill();
      }

      doResize();
      window.addEventListener('resize', resize);

      // Reduced motion: one static grid, no pointer tracking and no rAF loop.
      if (reduced) {
        draw();
        return () => {
          clearTimeout(resizeTimer);
          window.removeEventListener('resize', resize);
        };
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      const speedInterval = setInterval(updateMouseSpeed, 20);

      let inView = true;
      let pageVisible = !document.hidden;

      const tick = (): void => {
        frameCount++;
        draw();
        rafRef.current = requestAnimationFrame(tick);
      };

      const tryStart = (): void => {
        if (inView && pageVisible && rafRef.current === 0)
          rafRef.current = requestAnimationFrame(tick);
      };
      const tryStop = (): void => {
        if (rafRef.current !== 0) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) tryStart();
          else tryStop();
        },
        { threshold: 0 },
      );
      io.observe(container);

      const onVisibility = (): void => {
        pageVisible = !document.hidden;
        if (pageVisible) tryStart();
        else tryStop();
      };
      document.addEventListener('visibilitychange', onVisibility);

      tryStart();

      rebuildRef.current = () => {
        const { w, h } = sizeRef.current;
        if (w > 0 && h > 0) buildDots(w, h);
      };

      return () => {
        tryStop();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        clearInterval(speedInterval);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouseMove);
      };
      // Effect owns the canvas lifecycle. Prop changes flow through settingsRef.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      rebuildRef.current?.();
    }, [dotRadius, dotSpacing]);

    return (
      <div className={`relative h-full w-full ${className}`.trim()} {...rest}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <svg
          aria-hidden="true"
          focusable="false"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <radialGradient id={glowIdRef.current}>
              <stop offset="0%" stopColor={glowColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle
            ref={glowRef}
            cx="-9999"
            cy="-9999"
            r={glowRadius}
            fill={`url(#${glowIdRef.current})`}
            style={{ opacity: 0, willChange: 'opacity' }}
          />
        </svg>
      </div>
    );
  },
);

DotField.displayName = 'DotField';

export default DotField;
