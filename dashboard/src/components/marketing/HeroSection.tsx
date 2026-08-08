import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/components/shared/Section';
import { ShinyText } from '@/components/reactbits/ShinyText';
import { SpecularButton } from '@/components/reactbits/SpecularButton';

// === Component

/*
  Hero. Two columns from lg: copy left, the render right.

  This used to mount LaserFlow, a three-based WebGL beam that was the single largest entry
  in the marketing bundle. The still render carries far more meaning for a fraction of the
  weight, so three is gone from the route entirely.

  No `use client`. Nothing here is stateful, so the hero renders on the server and the LCP
  image is in the initial HTML. SpecularButton and ShinyText draw their own client
  boundaries and take only serialisable props.
*/
export function HeroSection() {
  return (
    <Section
      id="hero"
      spacing="loose"
      fullHeight
      background="bg-surface"
      innerClassName="flex items-center"
    >
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="flex w-full flex-col items-center gap-6 text-center lg:items-start lg:text-left">
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

          {/* Full width and centred on mobile, natural width from sm. */}
          <div className="mx-auto w-full max-w-sm sm:mx-0 sm:w-auto lg:mr-auto">
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
        </div>

        {/*
          The art is a grid child rather than Section decoration. The beam it replaced was
          decoration so it could bleed past the column edge; this is a composed plate that
          has to stay whole, and cropping it would cut the agent off one end and the settled
          transaction off the other.

          mx-auto centres it in the stacked layout below lg, where it sits under the copy.

          `isolate` contains the -z-10 glow. Without a stacking context here it escapes this
          subtree and lands behind the page, under the ambient DotField.
        */}
        <div className="relative isolate mx-auto w-full max-w-hero-art">
          {/* Grounds the plate in the page palette. The render sits on pure black and the
              page is #0a0a0a, so without this the square edge is faintly visible. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-green/10 blur-3xl"
          />
          <Image
            src="/hero/ai-gateway.png"
            alt="An AI agent sends a transfer intent into a policy gate. The gate checks target, action, limit, guardian, and timelock, then the transaction is signed and confirmed on-chain. The gate stands on a ring labelled limits, whitelist, guardian, daily limit, timelock, and audit trail."
            width={1254}
            height={1254}
            /* LCP element, so it must not be lazy loaded. */
            priority
            sizes="(min-width: 1024px) 550px, 100vw"
            className="h-auto w-full animate-art-float"
          />
        </div>
      </div>
    </Section>
  );
}
