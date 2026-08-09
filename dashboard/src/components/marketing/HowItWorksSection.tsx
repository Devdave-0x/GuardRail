'use client';

import type { FlowStep } from '@/types';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useSectionReveal } from '@/hooks';

// === Data

const FLOW: FlowStep[] = [
  {
    id: 'prompt',
    label: 'User prompt',
    detail: 'You state a goal in your IDE or chat client.',
  },
  {
    id: 'mcp',
    label: 'MCP server',
    detail: 'The agent picks a tool and proposes a concrete transaction.',
  },
  {
    id: 'contract',
    label: 'AgentWallet.sol',
    detail: 'Every guard runs here. A call that violates one reverts.',
  },
  {
    id: 'chain',
    label: 'Sepolia or BOT Chain',
    detail: 'Only calls that satisfied the policy reach the chain.',
  },
];

// === Component

export function HowItWorksSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="how-it-works" background="bg-surface-panel" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="how-it-works"
            eyebrow="Architecture"
            title="How it works"
            description="Your prompt reaches the chain through a policy the agent cannot talk its way around."
          />
        </div>

        <ol className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {FLOW.map((step, index) => (
            <li
              key={step.id}
              data-reveal
              className="relative flex h-full flex-col gap-3 rounded-lg border border-border bg-bg p-6"
            >
              <span className="font-mono text-xs text-green">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                {step.label}
              </h3>
              <p className="font-mono text-caption text-text-secondary">{step.detail}</p>
              {index < FLOW.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 text-green lg:-right-3 lg:bottom-1/2 lg:left-auto lg:block lg:translate-x-0 lg:translate-y-1/2"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <p data-reveal className="font-mono text-xs text-text-muted">
          The chain is selected at runtime through CHAIN_ID, so switching networks needs no code
          change in the contract or the agent.
        </p>
      </div>
    </Section>
  );
}
