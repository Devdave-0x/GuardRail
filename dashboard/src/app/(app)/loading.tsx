import { cn } from '@/lib/utils';

/*
  Route-level Suspense fallback for the /app segment. Next only mounts this while the
  segment itself is still arriving (first-visit chunk download, cold RSC render). Once
  the real page commits, `panel-in` in DashboardPage takes over as the landing motion, so
  this file owns the wait, not the arrival.

  Static, not shimmering: a moving gradient sweep is the glossy-AI-dashboard cliché this
  product's visual language (docs/Context.md, "human over AI") deliberately rejects. A
  quiet opacity breathe reads as "the page is already here, filling in" rather than
  "please wait for magic."

  Spans mirror DashboardPage's grid exactly (same order, same lg:col-span-*) so nothing
  reflows when the real panels replace these, only their content crossfades in.
*/

const SKELETON_SPANS = [
  'lg:col-span-5', // Overview
  'lg:col-span-4', // Spending limits
  'lg:col-span-3', // Guardian control
  'lg:col-span-7', // Agent chat
  'lg:col-span-5', // Whitelist manager
  'lg:col-span-8', // Transaction history
  'lg:col-span-4', // Token policy
] as const;

function PanelSkeleton({ span, lines = 3 }: { span: string; lines?: number }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-bg-panel',
        span,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
        <div className="h-3 w-3 animate-pulse rounded-full bg-bg-elevated" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-bg-elevated"
            style={{ width: `${85 - i * 18}%`, animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AppLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto grid w-full max-w-container grid-cols-1 items-start gap-panel-gap px-section-px py-section-py-tight lg:grid-cols-12"
    >
      <span className="sr-only">Loading dashboard</span>
      {SKELETON_SPANS.map((span, i) => (
        <PanelSkeleton key={i} span={span} lines={i === 3 || i === 5 ? 5 : 3} />
      ))}
    </div>
  );
}
