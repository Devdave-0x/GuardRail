'use client';

import { Fingerprint, Lock, ScrollText, Share2 } from 'lucide-react';
import type { Capability } from '@/types';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useSectionReveal } from '@/hooks';

// === Data

const CAPABILITIES: Capability[] = [
  {
    id: 'tee',
    accent: 'violet',
    icon: Lock,
    title: 'Encrypted TEE session',
    body: 'Every agent session opens inside a Trusted Execution Environment through the T3N SDK.',
  },
  {
    id: 'did',
    accent: 'cyan',
    icon: Fingerprint,
    title: 'did:t3n identifier',
    body: 'The agent receives a decentralized identifier cryptographically linked to its AgentWallet address.',
  },
  {
    id: 'audit',
    accent: 'blue',
    icon: ScrollText,
    title: 'Immutable audit trail',
    body: 'Every action is logged to the T3N ledger, so the record cannot be edited after the fact.',
  },
  {
    id: 'protocols',
    accent: 'green',
    icon: Share2,
    title: 'Protocol compatible',
    body: 'Works alongside A2A, ERC-8004, and MCP rather than replacing any of them.',
  },
];

// === Component

export function IdentitySection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="identity" background="bg-surface-panel" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="identity"
            eyebrow="Verifiable identity"
            title="Prove which agent did what"
            description="GuardRail integrates Terminal 3 Network so an agent's actions carry a cryptographic identity, not just a wallet address."
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CAPABILITIES.map((capability) => {
            const Icon = capability.icon;
            return (
              <li
                key={capability.id}
                data-reveal
                className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-6"
              >
                <Icon size={20} className="text-blue-bright" aria-hidden="true" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                  {capability.title}
                </h3>
                <p className="font-mono text-caption text-text-secondary">{capability.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
