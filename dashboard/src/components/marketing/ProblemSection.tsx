'use client';

import { KeyRound, MessageSquareWarning, Repeat } from 'lucide-react';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { useSectionReveal } from '@/hooks';

// === Data

const PROBLEMS = [
  {
    id: 'raw-key',
    icon: KeyRound,
    title: 'A raw key is all or nothing',
    body: 'Hand an agent a private key and it can drain the wallet in one call. There is no middle setting between no access and total access.',
  },
  {
    id: 'prompt-rules',
    icon: MessageSquareWarning,
    title: 'Prompt rules are suggestions',
    body: 'A limit written in a system prompt holds until the model is confused, jailbroken, or simply wrong. Nothing enforces it.',
  },
  {
    id: 'no-undo',
    icon: Repeat,
    title: 'On-chain mistakes are final',
    body: 'There is no chargeback and no support ticket. The only workable control is one that runs before the transaction settles.',
  },
] as const;

// === Component

export function ProblemSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="problem" background="bg-bg" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="problem"
            eyebrow="The problem"
            title="An agent with a private key is an agent with no limits"
            description="Every failure mode below is one an autonomous agent hits in normal operation, not under attack."
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PROBLEMS.map((problem) => {
            const Icon = problem.icon;
            return (
              <li key={problem.id} data-reveal>
                <SpotlightCard className="flex h-full flex-col gap-3 rounded-lg border border-border bg-bg-panel p-6">
                  <Icon size={20} className="text-orange" aria-hidden="true" />
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                    {problem.title}
                  </h3>
                  <p className="font-mono text-xs leading-relaxed text-text-secondary">
                    {problem.body}
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
