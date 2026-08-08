'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';
import { ShieldCheck, Timer } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { AppLogo } from '@/components/shared/AppLogo';
import { ScrollProgress } from '@/components/shared/ScrollProgress';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { cn } from '@/lib/utils';

// === Component

/*
  App-route header. Mirrors NavigationBar's scroll behaviour and lockup so the two route
  groups read as one product, but stays on wagmi and RainbowKit, which NavigationBar may
  never import.

  Two rows: identity and wallet on top, chain telemetry below. The rail on the bottom edge
  is the scroll readout, which is why this header sets no border-b of its own.
*/
export function Navbar() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: contractBalance } = useBalance({ address: CONTRACT_ADDRESS });
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        // bg-surface at rest lets the ambient layer through; solid once content scrolls under.
        scrolled ? 'bg-bg/90 backdrop-blur' : 'bg-surface',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-container items-center justify-between gap-4 px-section-px lg:h-16">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center rounded" aria-label="GuardRail home">
            <AppLogo variant="full" size="md" />
          </Link>
          <span aria-hidden="true" className="hidden text-border-bright sm:inline">
            |
          </span>
          <span className="hidden font-mono text-micro uppercase tracking-wider text-text-muted sm:inline">
            BOT Chain Testnet
          </span>
        </div>

        {contractBalance && (
          <div className="hidden items-center gap-2 font-mono lg:flex">
            <span className="text-micro uppercase tracking-wider text-text-muted">
              Vault Balance
            </span>
            {/* Updates on a poll with no user action, so announce it politely. */}
            <span aria-live="polite" className="font-mono-numbers text-body font-bold text-green">
              {parseFloat(formatEther(contractBalance.value)).toFixed(6)} BOT
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {balance && (
            <span className="font-mono-numbers hidden font-mono text-caption text-text-secondary sm:block">
              {parseFloat(formatEther(balance.value)).toFixed(4)} BOT
            </span>
          )}
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
          />
        </div>
      </div>

      <div className="relative border-t border-border/50">
        <div className="mx-auto flex w-full max-w-container items-center justify-between gap-4 px-section-px py-2">
          <div className="flex shrink-0 items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green" />
            <span className="font-mono-numbers font-mono text-micro text-text-muted">
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-micro uppercase tracking-wider text-text-muted">
            <span className="font-mono-numbers">CHAIN:968</span>
            <span aria-hidden="true" className="text-border-bright">
              |
            </span>
            <span className="inline-flex items-center gap-1">
              <Timer size={11} aria-hidden="true" /> TIMELOCK:10MIN
            </span>
            <span aria-hidden="true" className="hidden text-border-bright sm:inline">
              |
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <ShieldCheck size={11} aria-hidden="true" /> REENTRANCY:GUARDED
            </span>
          </div>
        </div>

        <ScrollProgress />
      </div>
    </header>
  );
}
