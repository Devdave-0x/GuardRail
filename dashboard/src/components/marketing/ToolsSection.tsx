'use client';

import {
  MdOutlineAttachMoney,
  MdOutlineSpeed,
  MdOutlineAccessTime,
  MdOutlineCheckBox,
  MdOutlineSearch,
  MdOutlineSend,
  MdOutlineTimer,
  MdOutlineAccountBalanceWallet,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
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
const ICONS: Record<string, IconType> = {
  wallet: MdOutlineAccountBalanceWallet,
  send: MdOutlineSend,
  coins: MdOutlineAttachMoney,
  gauge: MdOutlineSpeed,
  search: MdOutlineSearch,
  'list-checks': MdOutlineCheckBox,
  timer: MdOutlineTimer,
  history: MdOutlineAccessTime,
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

        {/*
          A reference table, not a card grid — this is API surface, and eight padded cards
          made it look like eight more value props instead of what it is: a --help listing
          for the MCP tools your assistant can actually call.
        */}
        <ol className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg-panel">
          {MCP_TOOLS.map((tool, index) => {
            const Icon = ICONS[tool.icon];
            const accent = accentFor(tool.accent);

            return (
              <li
                key={tool.name}
                data-reveal
                className="group grid grid-cols-[auto_1fr] items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-bg-hover sm:grid-cols-[auto_10rem_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="hidden font-mono text-xs tabular-nums text-text-muted sm:block"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
                  {Icon && (
                    <Icon size={14} aria-hidden="true" className={`shrink-0 ${accent.text}`} />
                  )}
                  <code className={`truncate font-mono text-xs font-bold ${accent.text}`}>
                    {tool.name}
                  </code>
                </div>

                <p className="col-span-2 font-mono text-caption text-text-secondary sm:col-span-1">
                  {tool.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
