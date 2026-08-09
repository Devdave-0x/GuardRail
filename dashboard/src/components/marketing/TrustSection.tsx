'use client';

import {
  MdOutlineDescription,
  MdOutlineFingerprint,
  MdOutlineLock,
  MdOutlineReceiptLong,
  MdOutlineShare,
  MdOutlineSecurityUpdateGood,
} from 'react-icons/md';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { DEPLOYMENTS } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Data

/*
  Signed / Recorded / Open — structurally borrowed, but every claim points at something
  that's actually true of this deployment: the contract is verified (we ran
  forge verify-contract against Blockscout earlier), every guarded call emits a real
  Executed event, and the explorer link is the live BOT Chain mainnet deployment.
*/
const PILLARS = [
  {
    id: 'signed',
    icon: MdOutlineSecurityUpdateGood,
    title: 'Signed',
    body: 'Every call the agent makes is checked against the contract’s guards before it is signed. Nothing reaches the chain that violates a limit, a whitelist, or a paused state.',
  },
  {
    id: 'recorded',
    icon: MdOutlineReceiptLong,
    title: 'Recorded',
    body: 'Every guarded call emits an Executed event on-chain — permanent, and queryable by anyone, not just by you.',
  },
  {
    id: 'open',
    icon: MdOutlineDescription,
    title: 'Open',
    body: 'The deployed bytecode is verified against this source on the block explorer. You can read the exact guards enforcing your policy, not take our word for them.',
  },
];

/*
  Absorbed from the old IdentitySection: those three claims (TEE session, did:t3n
  identifier, protocol compatibility) don't overlap with the pillars above the way
  "Immutable audit trail" did with Recorded, so they survive as supporting detail rather
  than a second full section repeating the same "you can trust this" point.
*/
const IDENTITY_DETAILS = [
  {
    id: 'tee',
    icon: MdOutlineLock,
    label: 'Encrypted TEE session',
    body: 'via the T3N SDK',
  },
  {
    id: 'did',
    icon: MdOutlineFingerprint,
    label: 'did:t3n identifier',
    body: 'linked to the AgentWallet address',
  },
  {
    id: 'protocols',
    icon: MdOutlineShare,
    label: 'Protocol compatible',
    body: 'A2A, ERC-8004, and MCP',
  },
];

const BOT_CHAIN_DEPLOYMENT = DEPLOYMENTS[1];

// === Component

export function TrustSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="trust" background="bg-surface-panel" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="trust"
            eyebrow="Verifiable"
            title="A policy that can't be edited after the fact."
            description="You're not trusting a description of what the contract does. You can read it."
          />
        </div>

        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <li
                key={pillar.id}
                data-reveal
                className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded border border-green/40 bg-green/10">
                  <Icon size={18} className="text-green" aria-hidden="true" />
                </span>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-text-primary">
                  {pillar.title}
                </h3>
                <p className="font-mono text-caption text-text-secondary">{pillar.body}</p>
              </li>
            );
          })}
        </ul>

        <div data-reveal className="flex flex-col gap-4 border-t border-border pt-8">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Backed by Terminal 3 Network
          </p>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
            {IDENTITY_DETAILS.map((detail) => {
              const Icon = detail.icon;
              return (
                <li key={detail.id} className="flex items-start gap-2.5">
                  <Icon size={16} className="mt-0.5 shrink-0 text-blue-bright" aria-hidden="true" />
                  <p className="font-mono text-caption text-text-secondary">
                    <span className="text-text-primary">{detail.label}</span> — {detail.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <a
          data-reveal
          href={BOT_CHAIN_DEPLOYMENT.explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline self-start font-mono text-xs uppercase tracking-wider text-blue-bright transition-colors hover:text-green"
        >
          Read the verified contract on {BOT_CHAIN_DEPLOYMENT.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </Section>
  );
}
