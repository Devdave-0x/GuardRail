import type { ReactNode } from 'react';
import {
  OverviewPanel,
  SpendingLimitsPanel,
  TransactionHistoryPanel,
  WhitelistManagerPanel,
  TokenPolicyPanel,
  AgentChatPanel,
  GuardianControlPanel,
} from '@/components/panels';
import { cn } from '@/lib/utils';

// === Reveal

/*
  Stagger step between panels. Long enough to read as a sequence, short enough that the
  last panel has landed well inside half a second.
*/
const REVEAL_STEP_MS = 55;

/*
  Grid cell plus mount reveal. The animation is the CSS `panel-in` keyframe rather than
  Motion, because Motion leaves a residual transform that re-bases the
  `background-attachment: fixed` inside every panel's `.edge-glow`. See tailwind.config.js.

  Reduced motion needs no branch here: the global backstop in globals.css collapses the
  duration, and `panel-in` resolves to the panel's natural resting state.
*/
function Cell({ span, index, children }: { span: string; index: number; children: ReactNode }) {
  return (
    <div
      className={cn('animate-panel-in', span)}
      style={{ animationDelay: `${index * REVEAL_STEP_MS}ms` }}
    >
      {children}
    </div>
  );
}

// === Page

/*
  One 12-column grid for the whole dashboard rather than a stack of independent row grids.
  Independent grids gave each row its own column edges, so nothing lined up vertically and
  the page read as noise. Here every panel snaps to the same 12 tracks.

  `items-start` stops a panel from stretching to its tallest sibling. Stretching does not
  add content, it only adds an empty box below the content, which is what made Spending
  Limits look broken next to Overview.

  Spans encode priority: the safety-critical read (Overview) is widest on its row, and the
  working surfaces (Chat, History) are widest on theirs.
*/
export default function DashboardPage() {
  return (
    <div className="mx-auto grid w-full max-w-container grid-cols-1 items-start gap-panel-gap px-section-px py-section-py-tight lg:grid-cols-12">
      {/* Panel titles are h2, so the page needs an h1 above them for heading order. */}
      <h1 className="sr-only">GuardRail dashboard</h1>

      <Cell span="lg:col-span-5" index={0}>
        <OverviewPanel />
      </Cell>
      <Cell span="lg:col-span-4" index={1}>
        <SpendingLimitsPanel />
      </Cell>
      <Cell span="lg:col-span-3" index={2}>
        <GuardianControlPanel />
      </Cell>

      <Cell span="lg:col-span-7" index={3}>
        <AgentChatPanel />
      </Cell>
      <Cell span="lg:col-span-5" index={4}>
        <WhitelistManagerPanel />
      </Cell>

      <Cell span="lg:col-span-8" index={5}>
        <TransactionHistoryPanel />
      </Cell>
      <Cell span="lg:col-span-4" index={6}>
        <TokenPolicyPanel />
      </Cell>
    </div>
  );
}
