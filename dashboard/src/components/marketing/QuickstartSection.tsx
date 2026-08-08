'use client';

import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Terminal } from '@/components/shared/Terminal';
import type { TerminalLine } from '@/types';
import { useSectionReveal } from '@/hooks';

// === Data

const INSTALL_COMMAND = 'npx create-eth-agent@latest my-agent';

const INSTALL_LINES: readonly TerminalLine[] = [
  { kind: 'prompt', text: INSTALL_COMMAND },
  { kind: 'output', text: '✔ Scaffolding agent in ./my-agent' },
  { kind: 'output', text: '✔ Installing dependencies' },
  { kind: 'output', text: '✔ Building runtime' },
  { kind: 'comment', text: '# Done. Next: resolve the MCP server path.' },
];

/*
  The args path in an MCP config must be absolute, and it is the single most common thing
  people get wrong here. Rather than printing a placeholder they have to decode, this
  block hands them a command whose output IS the value to paste.
*/
const PATH_COMMAND = 'echo "$(pwd)/runtime/dist/mcp-server.js"';

const PATH_LINES: readonly TerminalLine[] = [
  { kind: 'comment', text: '# From your project root:' },
  { kind: 'prompt', text: 'cd my-agent' },
  { kind: 'prompt', text: PATH_COMMAND },
  { kind: 'output', text: '/Users/you/my-agent/runtime/dist/mcp-server.js' },
  { kind: 'comment', text: '# Paste that line into "args" below.' },
];

const MCP_CONFIG = `{
  "mcpServers": {
    "eth-agent": {
      "command": "node",
      "args": ["<paste the path from step 2>"]
    }
  }
}`;

const MCP_LINES: readonly TerminalLine[] = [
  { kind: 'comment', text: '# claude_desktop_config.json' },
  { kind: 'output', text: MCP_CONFIG },
];

// === Component

export function QuickstartSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="quickstart" background="bg-surface-panel" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="quickstart"
            eyebrow="Developers"
            title="Running in one command"
            description="Scaffold an agent, resolve the server path, point your IDE at it, and start issuing goals."
          />
        </div>

        <ol className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <li data-reveal className="flex flex-col gap-3">
            <StepLabel index={1} label="Scaffold" />
            <Terminal
              title="bash"
              lines={INSTALL_LINES}
              copyValue={INSTALL_COMMAND}
              copyLabel="install command"
              animatedBorder
            />
          </li>

          <li data-reveal className="flex flex-col gap-3">
            <StepLabel index={2} label="Resolve the path" />
            <Terminal
              title="bash"
              lines={PATH_LINES}
              copyValue={PATH_COMMAND}
              copyLabel="path command"
            />
          </li>

          <li data-reveal className="flex flex-col gap-3">
            <StepLabel index={3} label="Configure MCP" />
            <Terminal
              title="claude_desktop_config.json"
              lines={MCP_LINES}
              copyValue={MCP_CONFIG}
              copyLabel="MCP config"
              animatedBorder
            />
          </li>
        </ol>

        <p data-reveal className="font-mono text-xs text-text-muted">
          Add the config to Claude Desktop, Cursor, or Kiro, restart the IDE, and the eight tools
          appear in your assistant.
        </p>
      </div>
    </Section>
  );
}

// === Step label

function StepLabel({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-green/40 bg-green/10 font-mono text-micro font-bold text-green"
      >
        {index}
      </span>
      <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">
        {label}
      </span>
    </div>
  );
}
