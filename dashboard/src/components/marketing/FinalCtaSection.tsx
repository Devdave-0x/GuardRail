'use client';

import Link from 'next/link';
import { Section } from '@/components/shared/Section';
import { SpecularButton } from '@/components/reactbits/SpecularButton';
import { GITHUB_URL } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Component

/*
  Second and last SpecularButton on the page. Two instances is the whole WebGL button
  budget for the marketing route; everything else uses the CSS edge glow.
*/
export function FinalCtaSection() {
  const containerRef = useSectionReveal();

  return (
    <Section
      id="get-started"
      spacing="loose"
      background="bg-surface"
      label="Get started with GuardRail"
    >
      <div ref={containerRef} className="flex flex-col items-center gap-6 text-center">
        <h2 data-reveal className="max-w-2xl text-balance text-h2 font-bold text-text-primary">
          Ship an autonomous agent you do not have to babysit.
        </h2>

        <p data-reveal className="max-w-xl text-pretty font-mono text-body text-text-secondary">
          Free, open source, and already live on two testnets. Deploy your own AgentWallet or
          connect to the existing one.
        </p>

        <div
          data-reveal
          className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
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
              Star on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
