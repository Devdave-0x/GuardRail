'use client';

import { useAccount, useBalance } from 'wagmi';
import { ShieldCheck, Timer } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { formatEther } from 'viem';

export function Navbar() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: contractBalance } = useBalance({ address: CONTRACT_ADDRESS });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-green">
              GuardRail
            </span>
          </div>
          <span className="text-xs text-border-bright">|</span>
          <span className="font-mono text-xs text-text-muted">BOT Chain Testnet</span>
        </div>

        {/* Center: contract balance */}
        {contractBalance && (
          <div className="hidden items-center gap-2 font-mono text-xs md:flex">
            <span className="text-text-muted">Vault Balance:</span>
            <span className="font-bold text-green">
              {parseFloat(formatEther(contractBalance.value)).toFixed(6)} BOT
            </span>
          </div>
        )}

        {/* Wallet */}
        <div className="flex items-center gap-2">
          {balance && (
            <span className="hidden font-mono text-xs text-text-muted sm:block">
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

      {/* Network status bar */}
      <div className="flex items-center justify-between gap-4 border-t border-border/50 bg-bg px-4 py-1.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="font-mono text-xs text-text-muted">
            {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
          <span>CHAIN:968</span>
          <span className="text-border-bright">|</span>
          <span className="inline-flex items-center gap-1">
            <Timer size={12} /> TIMELOCK:10MIN
          </span>
          <span className="text-border-bright">|</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={12} /> REENTRANCY:GUARDED
          </span>
        </div>
      </div>
    </header>
  );
}
