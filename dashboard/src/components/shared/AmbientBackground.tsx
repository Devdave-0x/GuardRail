'use client';

import { DotField } from '@/components/reactbits/DotField';
import { usePointerGlow } from '@/hooks/usePointerGlow';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrollParallax } from '@/hooks/useScrollParallax';

// === Types

export interface AmbientBackgroundProps {
  /*
    `full` is the marketing treatment: mesh, grid, dots, and pointer spotlight.
    `subtle` is the dashboard treatment. Same vocabulary at lower intensity, because an
    instrument panel should not compete with its own readings.
  */
  variant?: 'full' | 'subtle';
}

// === Component

/*
  The entire ambient background for a route group, plus the two delegated listeners that
  drive it. Mount once, in the route group's layout.

  Every layer is CSS. Only DotField touches a canvas, and it is Canvas 2D rather than
  WebGL, so this whole stack costs zero contexts against the budget in docs/Context.md.

  It also owns usePointerGlow, which feeds both the spotlight here and every .edge-glow
  border elsewhere on the page. Do not mount PointerGlow separately alongside this.
*/
export function AmbientBackground({ variant = 'full' }: AmbientBackgroundProps) {
  const prefersReduced = usePrefersReducedMotion();

  usePointerGlow();
  useScrollParallax();

  const isSubtle = variant === 'subtle';

  return (
    <div aria-hidden="true">
      <div className="bg-mesh" style={isSubtle ? { opacity: 0.22 } : undefined} />
      <div className="bg-grid" style={isSubtle ? { opacity: 0.16 } : undefined} />

      {/*
        DotField runs a rAF loop, so it is the one layer worth dropping entirely under
        reduced motion rather than merely freezing.
      */}
      {!prefersReduced && (
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ opacity: isSubtle ? 0.35 : 0.8 }}
        >
          <DotField
            gradientFrom="#00ff88"
            gradientTo="#0070f3"
            glowColor="#00ff88"
            dotSpacing={32}
            className="h-full w-full"
          />
        </div>
      )}

      <div className="bg-spotlight" style={isSubtle ? { opacity: 0.5 } : undefined} />
    </div>
  );
}
