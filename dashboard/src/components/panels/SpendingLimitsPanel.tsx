'use client';

import { Panel, ProgressBar, Countdown, Badge } from '@/components/shared';
import { useContractState } from '@/hooks/useContractState';

export function SpendingLimitsPanel() {
  const { data, loading, error } = useContractState();

  const spentPercent = data?.dailySpentPercent ?? 0;
  const panelStatus = spentPercent >= 90 ? 'error' : spentPercent >= 70 ? 'warn' : 'ok';

  return (
    <Panel
      title="Spending Limits"
      subtitle="BOT per-tx and daily caps"
      status={loading ? 'ok' : panelStatus}
      loading={loading}
    >
      <div className="space-y-5 p-4">
        {error && <div className="font-mono text-xs text-red">Error loading limits</div>}

        {/* Current limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded border border-border bg-bg-elevated p-3">
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              Per-TX Limit
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {data ? parseFloat(data.ethTxLimitFormatted).toFixed(6) : '—'}
            </p>
            <p className="font-mono text-xs text-text-muted">BOT max/tx</p>
          </div>
          <div className="rounded border border-border bg-bg-elevated p-3">
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-text-muted">
              Daily Limit
            </p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {data ? parseFloat(data.ethDailyLimitFormatted).toFixed(6) : '—'}
            </p>
            <p className="font-mono text-xs text-text-muted">BOT/day</p>
          </div>
        </div>

        {/* Daily spend progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
              Daily Spent
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-secondary">
                {data ? parseFloat(data.ethDailySpentFormatted).toFixed(6) : '0.000000'}
                {' / '}
                {data ? parseFloat(data.ethDailyLimitFormatted).toFixed(6) : '0.000000'} BOT
              </span>
            </div>
          </div>
          <ProgressBar value={spentPercent} warn={70} danger={90} />
          {spentPercent >= 90 && (
            <div className="flex items-center gap-1 font-mono text-xs text-red">
              <span className="animate-blink">▲</span> DAILY LIMIT CRITICAL
            </div>
          )}
          {spentPercent >= 70 && spentPercent < 90 && (
            <div className="flex items-center gap-1 font-mono text-xs text-orange">
              <span>▲</span> LIMIT APPROACHING
            </div>
          )}
        </div>

        {/* Pending limit change */}
        {data?.pendingLimitChange && (
          <div className="space-y-2 rounded border border-orange/40 bg-orange/5 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="orange">⏳ Pending Limit Change</Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="font-mono text-xs text-text-muted">New Per-TX</p>
                <p className="font-mono text-xs font-bold text-orange">
                  {parseFloat(data.pendingLimitChange.txLimitFormatted).toFixed(6)} BOT
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-text-muted">New Daily</p>
                <p className="font-mono text-xs font-bold text-orange">
                  {parseFloat(data.pendingLimitChange.dailyLimitFormatted).toFixed(6)} BOT
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-orange/20 pt-1">
              <span className="font-mono text-xs text-text-muted">Unlocks in:</span>
              <Countdown unlockTimeMs={data.pendingLimitChange.unlockTimeMs} />
            </div>
          </div>
        )}

        {!data?.pendingLimitChange && (
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <span className="text-green">✓</span> No pending limit changes
          </div>
        )}
      </div>
    </Panel>
  );
}
