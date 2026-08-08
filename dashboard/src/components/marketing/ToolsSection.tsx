'use client';

import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MCP_TOOLS } from '@/lib/marketing-stats';
import { useSectionReveal } from '@/hooks';

// === Component

export function ToolsSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="tools" background="bg-bg" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="tools"
            eyebrow="MCP surface"
            title="Eight tools your assistant can call"
            description="Exposed over the Model Context Protocol, so any MCP-aware client can drive the wallet."
          />
        </div>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {MCP_TOOLS.map((tool) => (
            <li
              key={tool.name}
              data-reveal
              className="flex flex-col gap-1.5 bg-bg-panel p-5 transition-colors hover:bg-bg-elevated"
            >
              <code className="font-mono text-xs font-bold text-green">{tool.name}</code>
              <p className="font-mono text-xs leading-relaxed text-text-secondary">
                {tool.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
