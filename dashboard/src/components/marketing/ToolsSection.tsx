'use client';

import {
  Coins,
  Gauge,
  History,
  ListChecks,
  Search,
  Send,
  Timer,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MCP_TOOLS } from '@/lib/marketing-stats';
import { accentFor } from '@/lib/accents';
import { useSectionReveal } from '@/hooks';

// === Icons

/*
  McpTool carries an icon name rather than a component so the data file stays free of JSX
  imports. Resolved here, where the icons are actually rendered.
*/
const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  send: Send,
  coins: Coins,
  gauge: Gauge,
  search: Search,
  'list-checks': ListChecks,
  timer: Timer,
  history: History,
};

// === Component

export function ToolsSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="tools" background="bg-surface" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="tools"
            eyebrow="MCP surface"
            title="Eight tools your assistant can call"
            description="Exposed over the Model Context Protocol, so any MCP-aware client can drive the wallet."
          />
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MCP_TOOLS.map((tool, index) => {
            const Icon = ICONS[tool.icon];
            const accent = accentFor(tool.accent);

            return (
              <li
                key={tool.name}
                data-reveal
                style={{ '--edge-glow-color': accent.glow } as React.CSSProperties}
                className="edge-glow group flex flex-col gap-3 rounded-lg border border-border bg-bg-panel p-4 transition-colors hover:border-border-bright"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${accent.border} ${accent.bg}`}
                  >
                    {Icon && <Icon size={15} aria-hidden="true" className={accent.text} />}
                  </span>
                  {/* Index is decoration over an ordered list, so keep it from screen readers. */}
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs font-bold tabular-nums text-text-muted transition-colors group-hover:text-text-secondary"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <code className={`break-words font-mono text-xs font-bold ${accent.text}`}>
                    {tool.name}
                  </code>
                  <p className="font-mono text-caption text-text-secondary">{tool.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
