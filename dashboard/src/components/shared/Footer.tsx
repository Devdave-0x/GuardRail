import Link from 'next/link';
import type { FooterSection } from '@/types';
import { DEPLOYMENTS, GITHUB_URL, MARKETING_NAV } from '@/lib/marketing-stats';
import { cn } from '@/lib/utils';

// === Types

export interface FooterProps {
  /*
    `marketing` renders the full sitemap. `app` renders the single compact status line
    the dashboard previously had inlined at the bottom of its page.
  */
  variant?: 'marketing' | 'app';
  className?: string;
}

// === Data

const FOOTER_SECTIONS: readonly FooterSection[] = [
  {
    title: 'Product',
    items: [...MARKETING_NAV, { label: 'Launch app', href: '/app' }],
  },
  {
    title: 'Deployments',
    items: DEPLOYMENTS.map((deployment) => ({
      label: deployment.name,
      href: deployment.explorer,
      external: true,
    })),
  },
  {
    title: 'Resources',
    items: [
      { label: 'GitHub', href: GITHUB_URL, external: true },
      { label: 'Documentation', href: `${GITHUB_URL}#readme`, external: true },
    ],
  },
];

const PRIMARY_DEPLOYMENT = DEPLOYMENTS[1];

// === Component

export function Footer({ variant = 'marketing', className }: FooterProps) {
  if (variant === 'app') {
    return (
      <footer
        className={cn(
          'mx-auto flex w-full max-w-container flex-col gap-stack-gap px-section-px pb-8 pt-4 font-mono text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between',
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>GuardRail Dashboard</span>
          <span aria-hidden="true" className="text-border-bright">
            |
          </span>
          <span>AgentWallet v1</span>
          <span aria-hidden="true" className="text-border-bright">
            |
          </span>
          <a
            href={PRIMARY_DEPLOYMENT.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded transition-colors hover:text-blue-bright"
          >
            {PRIMARY_DEPLOYMENT.address.slice(0, 6)}...{PRIMARY_DEPLOYMENT.address.slice(-4)}
            <span className="sr-only"> (opens in a new tab)</span>
            <span aria-hidden="true"> ↗</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
          <span>{PRIMARY_DEPLOYMENT.name}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn('relative h-full w-full border-t border-border bg-bg', className)}>
      <div className="mx-auto w-full max-w-container px-section-px py-section-py-tight">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-green" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-green">
                GuardRail
              </span>
            </div>
            <p className="max-w-xs font-mono text-xs leading-relaxed text-text-secondary">
              On-chain policy enforcement for autonomous agents. Limits, whitelists, and a guardian
              kill switch, enforced by the contract.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title} className="flex flex-col gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
                {section.title}
              </h2>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.label}`}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded font-mono text-xs text-text-secondary transition-colors hover:text-green"
                      >
                        {item.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="rounded font-mono text-xs text-text-secondary transition-colors hover:text-green"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 font-mono text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>GuardRail. Autonomous agents, on a short leash.</span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
