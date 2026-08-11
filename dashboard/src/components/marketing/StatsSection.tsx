'use client';

import { Section } from '@/components/shared/Section';
import { Terminal } from '@/components/shared/Terminal';
import { CountUp } from '@/components/reactbits/CountUp';
import { DERIVED_STATS } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Component

/*
  Every figure here is a derived constant from the contract and README, not a network
  read. Live figures belong in LiveProofStrip, which states when the chain is
  unreachable rather than animating a zero.

  Framed as a terminal readout rather than a stat band: the generic "big number, small
  label" grid is the same shape whether it's showing contract limits or app-store
  downloads. Reusing Terminal's chrome ties it to the same mono/CLI vocabulary as
  QuickstartSection, so it reads as "here's what the deployment actually is," not as a
  marketing stat band.
*/
export function StatsSection() {
  const containerRef = useSectionReveal<HTMLDListElement>();

  return (
    <Section
      id="stats"
      spacing="tight"
      background="bg-surface-panel"
      label="GuardRail by the numbers"
    >
      <Terminal title="guardrail --stats" lines={[{ kind: 'prompt', text: 'guardrail --stats' }]}>
        <dl
          ref={containerRef}
          className="mt-4 grid grid-cols-2 gap-6 border-t border-border pt-4 lg:grid-cols-4"
        >
          {DERIVED_STATS.map((stat) => (
            <div key={stat.id} data-reveal className="flex flex-col gap-1">
              <dd className="flex items-baseline gap-1 font-mono text-h2 font-bold text-green">
                <CountUp to={stat.value} duration={1.2} />
                {stat.suffix && <span className="text-caption">{stat.suffix}</span>}
              </dd>
              <dt className="font-mono text-micro uppercase tracking-wider text-text-muted">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </Terminal>
    </Section>
  );
}
