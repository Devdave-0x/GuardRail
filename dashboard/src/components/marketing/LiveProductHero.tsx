'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks';
import { DURATION, EASE_OUT } from '@/lib/motion-presets';

// === Types

interface ScriptStep {
  id: string;
  actor: 'agent' | 'policy' | 'chain';
  label: string;
  detail: string;
  /* Fraction of the daily limit consumed after this step resolves, 0 to 1. */
  dailySpent: number;
}

// === Script

/*
  Mirrors a real transfer_eth call through AgentWallet. Values are illustrative rather
  than read from chain, so the preview never depends on RPC availability.
*/
const SCRIPT: readonly ScriptStep[] = [
  {
    id: 'request',
    actor: 'agent',
    label: 'agent.request',
    detail: 'send 0.05 BOT to 0x829C...2e63',
    dailySpent: 0,
  },
  {
    id: 'limit',
    actor: 'policy',
    label: 'policy.checkTxLimit',
    detail: '0.05 <= 0.1 per-tx cap',
    dailySpent: 0,
  },
  {
    id: 'whitelist',
    actor: 'policy',
    label: 'policy.checkWhitelist',
    detail: 'target allowed, selector 0x00000000',
    dailySpent: 0,
  },
  {
    id: 'execute',
    actor: 'chain',
    label: 'chain.execute',
    detail: 'Executed(target, 0.05, 0x00000000)',
    dailySpent: 0.1,
  },
];

const STEP_MS = 1600;

const ACTOR_COLOR: Record<ScriptStep['actor'], string> = {
  agent: 'text-blue-bright',
  policy: 'text-green',
  chain: 'text-yellow',
};

// === Component

export function LiveProductHero() {
  const [index, setIndex] = useState<number>(0);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion gets the resolved end state, not a paused first frame.
    if (prefersReduced) {
      setIndex(SCRIPT.length - 1);
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SCRIPT.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [prefersReduced]);

  const step = SCRIPT[index];

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-green/30 bg-bg-panel"
      role="img"
      aria-label="Demonstration of GuardRail checking an agent transaction against its per-transaction limit and whitelist, then executing it on-chain and advancing the daily spend bar."
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-green">
          Agent activity
        </span>
        <span className="font-mono text-xs text-text-muted">AgentWallet v1</span>
      </div>

      {/*
        The whole replay is one conceptual image. Narrating four rotating steps to a
        screen reader would be noise, so the internals are hidden and the wrapper
        carries a descriptive label instead.
      */}
      <div aria-hidden="true" className="flex flex-col gap-5 p-4 lg:p-6">
        <ol className="flex flex-col gap-2">
          {SCRIPT.map((entry, entryIndex) => (
            <li
              key={entry.id}
              className={`flex flex-col gap-0.5 border-l-2 pl-3 font-mono text-xs transition-opacity duration-300 sm:flex-row sm:items-baseline sm:gap-3 ${
                entryIndex === index ? 'border-green opacity-100' : 'border-border opacity-35'
              }`}
            >
              <span className={ACTOR_COLOR[entry.actor]}>{entry.label}</span>
              <span className="text-text-secondary">{entry.detail}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">Daily spend</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReduced ? 0 : DURATION.fast }}
                className="font-bold text-green"
              >
                {(step.dailySpent * 100).toFixed(1)}%
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full border border-border bg-bg-elevated">
            <motion.div
              className="h-full rounded-full bg-green"
              animate={{ width: `${step.dailySpent * 100}%` }}
              transition={{ duration: prefersReduced ? 0 : DURATION.slow, ease: EASE_OUT }}
              style={{ boxShadow: '0 0 6px rgba(0,255,136,0.5)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
