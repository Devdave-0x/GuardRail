'use client';

import Link from 'next/link';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Section } from '@/components/shared/Section';
import { ShinyText } from '@/components/reactbits/ShinyText';
import { SpecularButton } from '@/components/reactbits/SpecularButton';
import { useInViewport, usePrefersReducedMotion } from '@/hooks';
import { GITHUB_URL } from '@/lib/marketing-stats';

/*
  LaserFlow imports three, which is by far the largest dependency in the marketing
  bundle. Loading it statically put it in the initial payload even though the component
  only ever renders once the hero is in view and motion is allowed. Importing it lazily
  keeps three out of First Load JS entirely.

  ssr: false because it is a WebGL canvas with nothing meaningful to render on the server.
*/
const LaserFlow = dynamic(
  () => import('@/components/reactbits/LaserFlow').then((mod) => mod.LaserFlow),
  { ssr: false },
);

// === Component

/*
  The one WebGL hero on the site. LaserFlow is three-based and is the single largest
  entry in the marketing bundle, so it mounts only while in view and never under
  reduced motion. See the WebGL budget in docs/Context.md.
*/
export function HeroSection() {
  const decorationRef = useRef<HTMLDivElement | null>(null);
  const inViewport = useInViewport(decorationRef, { rootMargin: '200px' });
  const prefersReduced = usePrefersReducedMotion();
  const showBeam = inViewport && !prefersReduced;

  return (
    <Section
      id="hero"
      spacing="loose"
      fullHeight
      background="bg-bg"
      innerClassName="flex flex-col justify-center gap-8"
      decoration={
        <div
          ref={decorationRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {showBeam && (
            <LaserFlow
              color="#00ff88"
              className="h-full w-full opacity-70"
              verticalBeamOffset={0.1}
              horizontalBeamOffset={0.0}
              flowSpeed={0.4}
            />
          )}
          {/* Keeps the headline legible over the beam at every viewport size. */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
        </div>
      }
    >
      <p className="font-mono text-xs uppercase tracking-widest text-green">
        <ShinyText text="On-chain agent policy" speed={4} />
      </p>

      <h1
        id="hero-heading"
        className="max-w-4xl text-balance text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
      >
        Give your AI agent a wallet. Keep the keys to the brakes.
      </h1>

      <p className="max-w-xl text-pretty font-mono text-sm leading-relaxed text-text-secondary lg:text-base">
        GuardRail puts spending limits, whitelists, token policies, and a guardian kill switch
        inside the contract. The agent cannot argue its way past any of them.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/app" className="inline-flex">
          <SpecularButton lineColor="#00ff88" baseColor="#0f0f0f" textColor="#00ff88" radius={6}>
            Launch the dashboard
          </SpecularButton>
        </Link>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="edge-glow inline-flex items-center justify-center rounded border border-border px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:border-border-bright hover:text-text-primary"
        >
          Read the contract
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Section>
  );
}
