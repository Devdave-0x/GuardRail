'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardResult {
  copied: boolean;
  error: string | null;
  copy: (value: string) => Promise<void>;
}

/*
  Copy-to-clipboard with a self-resetting "copied" flag. Extracted from AddressDisplay,
  which owned this inline, so the quickstart command block and the contract links can
  share it.

  The timeout is cleared on unmount, which the original inline version did not do: it
  called setState on an unmounted component whenever a panel refreshed within 2s of a copy.
*/
export function useCopyToClipboard(resetMs = 2000): UseCopyToClipboardResult {
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copy = useCallback(
    async (value: string): Promise<void> => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setError(null);
        timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
      } catch (cause) {
        // Clipboard access is denied in insecure contexts and some embedded browsers.
        setCopied(false);
        setError(cause instanceof Error ? cause.message : 'Copy failed');
      }
    },
    [resetMs],
  );

  return { copied, error, copy };
}
