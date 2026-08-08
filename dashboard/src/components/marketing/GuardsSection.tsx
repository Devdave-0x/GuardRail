'use client';

import {
  CalendarClock,
  Coins,
  Gauge,
  ListChecks,
  ShieldAlert,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { GUARDS } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Icons

/*
  GuardFeature carries an icon name rather than a component so the data file stays free
  of JSX imports. Resolved here, where the icons are actually rendered.
*/
const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  'calendar-clock': CalendarClock,
  'list-checks': ListChecks,
  coins: Coins,
  'shield-alert': ShieldAlert,
  timer: Timer,
};

// === Component

export function GuardsSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="guards" background="bg-bg" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="guards"
            eyebrow="Enforcement"
            title="Six guards, all on-chain"
            description="Every one of these lives in AgentWallet, so they hold even if the agent itself is compromised."
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUARDS.map((guard) => {
            const Icon = ICONS[guard.icon] ?? ShieldAlert;
            return (
              <li key={guard.id} data-reveal>
                <SpotlightCard className="flex h-full flex-col gap-3 rounded-lg border border-green/20 bg-bg-panel p-6">
                  <Icon size={20} className="text-green" aria-hidden="true" />
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                    {guard.title}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed text-text-secondary">
                    {guard.description}
                  </p>
                </SpotlightCard>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
