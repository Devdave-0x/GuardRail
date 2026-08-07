'use client';

import { RefreshCw } from 'lucide-react';
import { Panel, Badge, AddressDisplay } from '@/components/shared';
import { useContractState } from '@/hooks/useContractState';
import { CONTRACT_ADDRESS } from '@/lib/contract';

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
          onClick={refetch}
          className="p-1 text-text-muted transition-colors hover:text-green"
        >
          <RefreshCw size={12} />
        </button>
      }
    >
      <div className="space-y-5 p-4">
        {error && (
          <div className="rounded border border-red/30 bg-red/10 px-3 py-2 font-mono text-xs text-red">
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
            <span className="font-mono text-xs text-text-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Grid of stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              BOT Balance
            </p>
            <p className="font-mono text-lg font-bold text-green">
              {data ? parseFloat(data.balanceFormatted).toFixed(6) : '—'}
            </p>
            <p className="font-mono text-xs text-text-muted">BOT</p>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              Network
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">BOT Chain</p>
            <p className="font-mono text-xs text-text-muted">BOT Chain Testnet</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-2 border-t border-border pt-2">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-text-muted">Roles</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-xs text-text-muted">CONTRACT</span>
              <AddressDisplay address={CONTRACT_ADDRESS} />
            </div>
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-xs text-text-muted">AGENT</span>
              {data ? (
                <AddressDisplay address={data.agent} />
              ) : (
                <span className="font-mono text-xs text-text-muted">—</span>
              )}
            </div>
            <div className="flex items-center justify-between rounded bg-bg-elevated px-3 py-2">
              <span className="font-mono text-xs text-text-muted">GUARDIAN</span>
              {data ? (
                <AddressDisplay address={data.guardian} />
              ) : (
                <span className="font-mono text-xs text-text-muted">—</span>
              )}
            </div>
            {data?.pendingAgent &&
              data.pendingAgent !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex items-center justify-between rounded border border-orange/20 bg-orange/5 px-3 py-2">
                  <span className="font-mono text-xs text-orange">PENDING AGENT</span>
                  <AddressDisplay address={data.pendingAgent} />
                </div>
              )}
          </div>
        </div>

        {/* Chain ID */}
        <div className="flex items-center justify-between border-t border-border pt-1 font-mono text-xs text-text-muted">
          <span>CHAIN ID</span>
          <span className="text-text-secondary">968</span>
        </div>
      </div>
    </Panel>
  );
}
