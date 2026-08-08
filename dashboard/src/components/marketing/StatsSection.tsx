'use client';

import { Section } from '@/components/shared/Section';
import { CountUp } from '@/components/reactbits/CountUp';
import { DERIVED_STATS } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Component

/*
  Every figure here is a derived constant from the contract and README, not a network
  read. Live figures belong in LiveProofStrip, which states when the chain is
  unreachable rather than animating a zero.
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
      <dl ref={containerRef} className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {DERIVED_STATS.map((stat) => (
          <div key={stat.id} data-reveal className="flex flex-col gap-2">
            <dd className="flex items-baseline gap-1 font-mono text-h1 font-bold text-green">
              <CountUp to={stat.value} duration={1.2} />
              {stat.suffix && <span className="text-h3">{stat.suffix}</span>}
            </dd>
            <dt className="font-mono text-xs uppercase tracking-wider text-text-muted">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}
