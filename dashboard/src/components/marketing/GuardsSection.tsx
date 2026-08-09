'use client';

import {
  MdOutlineCalendarToday,
  MdOutlineAttachMoney,
  MdOutlineSpeed,
  MdOutlineCheckBox,
  MdOutlineSecurityUpdateWarning,
  MdOutlineTimer,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { GUARDS } from '@/lib/marketing-stats';
import { accentFor } from '@/lib/accents';
import { useSectionReveal } from '@/hooks';

// === Icons

/*
  GuardFeature carries an icon name rather than a component so the data file stays free
  of JSX imports. Resolved here, where the icons are actually rendered.
*/
const ICONS: Record<string, IconType> = {
  gauge: MdOutlineSpeed,
  'calendar-clock': MdOutlineCalendarToday,
  'list-checks': MdOutlineCheckBox,
  coins: MdOutlineAttachMoney,
  'shield-alert': MdOutlineSecurityUpdateWarning,
  timer: MdOutlineTimer,
};

// === Component

export function GuardsSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="guards" background="bg-surface" innerClassName="flex flex-col gap-12">
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
            const Icon = ICONS[guard.icon] ?? MdOutlineSecurityUpdateWarning;
            const accent = accentFor(guard.accent);
            return (
              <li key={guard.id} data-reveal>
                <SpotlightCard
                  className={`flex h-full flex-col gap-3 rounded-lg border ${accent.border} bg-bg-panel p-6`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded border ${accent.border} ${accent.bg}`}
                  >
                    <Icon size={18} className={accent.text} aria-hidden="true" />
                  </span>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                    {guard.title}
                  </h3>
                  <p className="font-mono text-caption text-text-secondary">{guard.description}</p>
                </SpotlightCard>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
