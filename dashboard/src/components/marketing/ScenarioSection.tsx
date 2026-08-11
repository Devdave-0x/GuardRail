'use client';

import { MdOutlineArrowForward } from 'react-icons/md';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useSectionReveal } from '@/hooks';

// === Data

/*
  Borrowed structurally from a "tell it your goal, see the outcome" pattern seen on other
  agent-facing products, but every outcome here is a restatement of a real GUARDS entry
  (src/lib/marketing-stats.ts), not invented copy. This is what AgentChatPanel actually
  does when you type a goal, just walked through in prose instead of live in the chat.
*/
interface Scenario {
  id: string;
  goal: string;
  outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'send',
    goal: 'Send 0.05 BOT to my exchange wallet.',
    outcome:
      'Checked against the target whitelist and the per-transaction limit, then executed immediately, no timelock, because the recipient was already approved.',
  },
  {
    id: 'automate',
    goal: 'Pay out up to 0.1 BOT a day, automatically.',
    outcome:
      'The daily limit enforces the ceiling in the contract itself. The agent can retry all day; the total never crosses 0.1 BOT.',
  },
  {
    id: 'whitelist',
    goal: 'Add a new address to the whitelist.',
    outcome:
      'Queued behind the timelock. You have a window to cancel before it takes effect, the agent cannot skip the wait.',
  },
  {
    id: 'stop',
    goal: "Something's wrong. Stop everything.",
    outcome:
      'The guardian kill switch pauses every agent action instantly, no timelock, no vote: a separate key the agent never holds.',
  },
];

// === Component

export function ScenarioSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="scenarios" background="bg-surface" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="scenarios"
            eyebrow="In practice"
            title="Tell it a goal. The contract decides what happens."
            description="Four things you could actually type into Agent Chat, and what the wallet does with each one."
          />
        </div>

        {/*
          A rule-divided, left-aligned exchange, goal then outcome, always in the same
          reading direction, rather than a card grid. This is the one section shaped like
          a conversation transcript instead of a feature grid, on purpose: it should read
          as "here's what actually happens," not as another set of value props.
        */}
        <ul className="flex flex-col divide-y divide-border border-t border-border">
          {SCENARIOS.map((scenario) => (
            <li key={scenario.id} data-reveal className="flex flex-col gap-3 py-6">
              <p className="max-w-2xl text-balance font-serif text-xl italic text-text-primary">
                &ldquo;{scenario.goal}&rdquo;
              </p>
              <div className="flex max-w-2xl items-start gap-2 pl-1">
                <MdOutlineArrowForward
                  size={16}
                  className="mt-0.5 shrink-0 text-green"
                  aria-hidden="true"
                />
                <p className="font-mono text-caption text-text-secondary">{scenario.outcome}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
