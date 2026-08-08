'use client';

import Link from 'next/link';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Section } from '@/components/shared/Section';
import { ShinyText } from '@/components/reactbits/ShinyText';
import { SpecularButton } from '@/components/reactbits/SpecularButton';
import { useInViewport } from '@/hooks/useInViewport';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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

  Layout is a single centred column on mobile and two columns from sm, with the copy on
  the left and the beam occupying the right. The beam is decoration rather than a grid
  child so it can bleed past the column edge.
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
      innerClassName="flex items-center"
      decoration={
        <div
          ref={decorationRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/*
            Full bleed on mobile, where the copy is centred over it. From sm the beam is
            confined to the right half so it sits beside the headline instead of under it.
          */}
          <div className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-1/2">
            {showBeam && (
              <LaserFlow
                color="#00ff88"
                className="h-full w-full opacity-70"
                verticalBeamOffset={0.1}
                horizontalBeamOffset={0.0}
                flowSpeed={0.4}
              />
            )}
          </div>

          {/* Keeps the headline legible over the beam at every viewport size. */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-bg via-bg/80 to-transparent sm:block" />
        </div>
      }
    >
      <div className="flex w-full flex-col items-center gap-6 text-center sm:max-w-2xl sm:items-start sm:text-left lg:max-w-3xl">
        <p className="font-mono text-caption uppercase tracking-widest text-green">
          <ShinyText text="On-chain agent policy" speed={4} />
        </p>

        <h1
          id="hero-heading"
          className="text-balance text-display font-extrabold text-text-primary"
        >
          Give your <span className="text-gradient">AI agent</span> a wallet. Keep the keys to{' '}
          <span className="text-green">the brakes</span>.
        </h1>

        <p className="max-w-xl text-pretty font-mono text-lead text-text-secondary">
          GuardRail puts spending limits, whitelists, token policies, and a guardian kill switch
          inside the contract. The agent cannot argue its way past any of them.
        </p>

        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          {/* Full width and centred on mobile, natural width from sm. */}
          <div className="mx-auto w-full max-w-sm sm:mx-0 sm:w-auto">
            <Link href="/app" className="inline-flex w-full">
              <SpecularButton
                lineColor="#00ff88"
                baseColor="#0f0f0f"
                textColor="#00ff88"
                radius={6}
              >
                Launch the dashboard
              </SpecularButton>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm sm:mx-0 sm:w-auto">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="edge-glow inline-flex w-full cursor-pointer items-center justify-center rounded border border-border px-5 py-3 font-mono text-caption font-bold uppercase tracking-wider text-text-secondary transition-all duration-300 ease-in-out hover:border-border-bright hover:text-text-primary"
            >
              Read the contract
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
