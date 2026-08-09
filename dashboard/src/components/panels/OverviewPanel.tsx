'use client';

import { MdOutlineRefresh } from 'react-icons/md';
import { Panel, Badge, AddressDisplay, Stat } from '@/components/shared';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { useContractState } from '@/hooks/useContractState';
import { CONTRACT_ADDRESS, activeChain } from '@/lib/contract';

export function OverviewPanel() {
  const { data, loading, error, refetch, lastUpdated } = useContractState();

  return (
    <Panel
      title="Overview"
      subtitle={`Contract: ${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`}
      status={data?.paused ? 'error' : error ? 'warn' : 'ok'}
      loading={loading}
      actions={
        <button
          type="button"
          onClick={refetch}
          aria-label="Refresh contract state"
          className="rounded p-1 text-text-muted transition-colors hover:text-green"
        >
          <MdOutlineRefresh size={12} aria-hidden="true" />
        </button>
      }
    >
      <div className="flex flex-col gap-5 p-4">
        {error && (
          <div
            role="alert"
            className="rounded border border-red/30 bg-red/10 px-3 py-2 font-mono text-caption text-red"
          >
            RPC ERROR: {error}
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          {data?.paused ? (
            <Badge variant="red" pulse>
              ⚠ PAUSED
            </Badge>
          ) : (
            <Badge variant="green" pulse>
              ● ACTIVE
            </Badge>
          )}
          <Badge variant="blue">BOT Chain</Badge>
          {lastUpdated && (
            <span className="font-mono-numbers font-mono text-micro text-text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Grid of stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* The vault balance is what this panel exists to report, so it alone gets `lead`. */}
          <Stat
            label="BOT Balance"
            color="green"
            emphasis="lead"
            hint="BOT"
            value={<AnimatedNumber value={data ? parseFloat(data.balanceFormatted) : NaN} />}
          />
          <Stat label="Network" value="BOT Chain" hint={activeChain.name} />
        </div>

        {/* Addresses */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="font-mono text-micro uppercase tracking-wider text-text-muted">Roles</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-micro uppercase tracking-wider text-text-muted">
                CONTRACT
              </span>
              <AddressDisplay address={CONTRACT_ADDRESS} />
            </div>
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-micro uppercase tracking-wider text-text-muted">
                AGENT
              </span>
              {data ? (
                <AddressDisplay address={data.agent} />
              ) : (
                <span className="font-mono text-caption text-text-muted">—</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-micro uppercase tracking-wider text-text-muted">
                GUARDIAN
              </span>
              {data ? (
                <AddressDisplay address={data.guardian} />
              ) : (
                <span className="font-mono text-caption text-text-muted">—</span>
              )}
            </div>
            {data?.pendingAgent &&
              data.pendingAgent !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex items-center justify-between rounded border border-orange/20 bg-orange/5 px-3 py-2">
                  <span className="font-mono text-micro uppercase tracking-wider text-orange">
                    PENDING AGENT
                  </span>
                  <AddressDisplay address={data.pendingAgent} />
                </div>
              )}
          </div>
        </div>

        {/* Chain ID */}
        <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-micro uppercase tracking-wider text-text-muted">
          <span>CHAIN ID</span>
          <span className="font-mono-numbers text-text-secondary">968</span>
        </div>
      </div>
    </Panel>
  );
}
