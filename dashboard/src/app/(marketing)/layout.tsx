'use client';

import { NavigationBar } from '@/components/shared/NavigationBar';
import { Footer } from '@/components/shared/Footer';
import { DotField } from '@/components/reactbits/DotField';
import { PointerGlow } from '@/components/shared/PointerGlow';
import { usePrefersReducedMotion } from '@/hooks';

/*
  Marketing group. Deliberately free of wagmi and RainbowKit so the homepage does not
  ship the wallet stack. The ambient DotField background mounts per section rather than
  here, so it can be gated on viewport visibility.

  usePointerGlow mounts once for the whole group: a single delegated pointermove listener
  feeding every .edge-glow element, instead of one WebGL context per button.
*/
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <>
      <PointerGlow />
      {/*
        Ambient background for the whole group. DotField is canvas 2D rather than WebGL,
        so it costs zero contexts against the budget and can stay mounted for the whole
        route. It sits behind everything and is never interactive.
      */}
      {!prefersReduced && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-40">
          <DotField
            gradientFrom="#00ff88"
            gradientTo="#0070f3"
            glowColor="#00ff88"
            dotSpacing={32}
            className="h-full w-full"
          />
        </div>
      )}

      <NavigationBar />
      <main id="main">{children}</main>
      <Footer variant="marketing" />
    </>
  );
}
