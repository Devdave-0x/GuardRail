'use client';

import { Check, Copy } from 'lucide-react';
import { Section } from '@/components/shared/Section';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useCopyToClipboard, useSectionReveal } from '@/hooks';

// === Data

const INSTALL_COMMAND = 'npx create-eth-agent@latest my-agent';

const MCP_CONFIG = `{
  "mcpServers": {
    "eth-agent": {
      "command": "node",
      "args": ["/full/path/to/runtime/dist/mcp-server.js"]
    }
  }
}`;

// === Copy block

interface CopyBlockProps {
  label: string;
  value: string;
  multiline?: boolean;
}

function CopyBlock({ label, value, multiline = false }: CopyBlockProps) {
  const { copied, copy, error } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-bg-panel p-4">
        <pre
          className={`min-w-0 flex-1 overflow-x-auto font-mono text-xs text-text-primary ${multiline ? '' : 'whitespace-pre-wrap'}`}
        >
          <code>{value}</code>
        </pre>
        <button
          type="button"
          onClick={() => copy(value)}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
          className="shrink-0 rounded border border-border p-1.5 text-text-muted transition-colors hover:border-green/50 hover:text-green"
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
        </button>
      </div>
      {/* Clipboard access is denied in insecure contexts, so surface the failure. */}
      {error && (
        <p role="alert" className="font-mono text-xs text-orange">
          Could not copy. Select the text and copy manually.
        </p>
      )}
    </div>
  );
}

// === Component

export function QuickstartSection() {
  const containerRef = useSectionReveal();

  return (
    <Section id="quickstart" background="bg-bg-panel" innerClassName="flex flex-col gap-12">
      <div ref={containerRef} className="flex flex-col gap-12">
        <div data-reveal>
          <SectionHeading
            id="quickstart"
            eyebrow="Developers"
            title="Running in one command"
            description="Scaffold an agent, point your IDE at the MCP server, and start issuing goals."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div data-reveal>
            <CopyBlock label="Install" value={INSTALL_COMMAND} />
          </div>
          <div data-reveal>
            <CopyBlock label="MCP config" value={MCP_CONFIG} multiline />
          </div>
        </div>

        <p data-reveal className="font-mono text-xs text-text-muted">
          Add the config to Claude Desktop, Cursor, or Kiro, restart the IDE, and the eight tools
          appear in your assistant.
        </p>
      </div>
    </Section>
  );
}
