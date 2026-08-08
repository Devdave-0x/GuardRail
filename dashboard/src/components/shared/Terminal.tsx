'use client';

import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { TerminalLine } from '@/types';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { DURATION, EASE_OUT } from '@/lib/motion-presets';
import { cn } from '@/lib/utils';

// === Types

export interface TerminalProps {
  title: string;
  lines: readonly TerminalLine[];
  /* Text placed on the clipboard. Usually the command, not the rendered output. */
  copyValue?: string;
  copyLabel?: string;
  /* Rotating conic border. Reserved for high-intent blocks. */
  animatedBorder?: boolean;
  className?: string;
  children?: ReactNode;
}

// === Line

/*
  Prompt lines get a green $ and are selectable as the command alone. Output and comment
  lines are dimmed so the eye separates what you type from what you get back.
*/
function Line({ line }: { line: TerminalLine }) {
  if (line.kind === 'comment') {
    return <span className="block text-text-muted">{line.text}</span>;
  }

  if (line.kind === 'output') {
    return <span className="block whitespace-pre-wrap text-text-secondary">{line.text}</span>;
  }

  return (
    <span className="block whitespace-pre-wrap text-text-primary">
      <span aria-hidden="true" className="mr-2 select-none text-green">
        $
      </span>
      {line.text}
    </span>
  );
}

// === Component

export function Terminal({
  title,
  lines,
  copyValue,
  copyLabel,
  animatedBorder = false,
  className,
  children,
}: TerminalProps) {
  const { copied, copy, error } = useCopyToClipboard();
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-panel',
        animatedBorder && 'animated-border',
        className,
      )}
    >
      {/* Chrome. The dots are decoration and must not be announced. */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
        <span aria-hidden="true" className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red/70" />
          <span className="h-2 w-2 rounded-full bg-yellow/70" />
          <span className="h-2 w-2 rounded-full bg-green/70" />
        </span>
        <span className="ml-1 min-w-0 flex-1 truncate font-mono text-xs text-text-muted">
          {title}
        </span>

        {copyValue && (
          <button
            type="button"
            onClick={() => copy(copyValue)}
            aria-label={copied ? `${copyLabel ?? title} copied` : `Copy ${copyLabel ?? title}`}
            className="relative shrink-0 rounded border border-border p-1.5 text-text-muted transition-colors hover:border-green/50 hover:text-green"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? 'copied' : 'idle'}
                initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.6 }}
                transition={{ duration: prefersReduced ? 0 : DURATION.fast, ease: EASE_OUT }}
                className="block"
              >
                {copied ? (
                  <Check size={13} aria-hidden="true" className="text-green" />
                ) : (
                  <Copy size={13} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto p-4">
        <pre className="font-mono text-xs leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <Line key={`${line.kind}-${index}`} line={line} />
            ))}
          </code>
        </pre>
        {children}
      </div>

      {/* Clipboard is unavailable in insecure contexts, so surface the failure. */}
      {error && (
        <p role="alert" className="px-4 pb-3 font-mono text-xs text-orange">
          Could not copy. Select the text and copy manually.
        </p>
      )}
    </div>
  );
}
