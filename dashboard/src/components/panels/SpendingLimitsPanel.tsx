'use client';

import { Panel, ProgressBar, Countdown, Badge, Stat } from '@/components/shared';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
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
      <div className="flex flex-col gap-5 p-4">
        {error && (
          <div role="alert" className="font-mono text-caption text-red">
            Error loading limits
          </div>
        )}

        {/* Current limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded border border-border bg-bg-elevated p-3">
            <Stat
              label="Per-TX Limit"
              hint="BOT max/tx"
              value={<AnimatedNumber value={data ? parseFloat(data.ethTxLimitFormatted) : NaN} />}
            />
          </div>
          <div className="rounded border border-border bg-bg-elevated p-3">
            <Stat
              label="Daily Limit"
              hint="BOT/day"
              value={
                <AnimatedNumber value={data ? parseFloat(data.ethDailyLimitFormatted) : NaN} />
              }
            />
          </div>
        </div>

        {/* Daily spend progress */}
        <div className="flex flex-col gap-3">
          {/* The figure the panel is really about: how close the agent is to its cap. */}
          <Stat
            label="Daily Spent"
            emphasis="lead"
            color={spentPercent >= 90 ? 'red' : spentPercent >= 70 ? 'orange' : 'green'}
            hint={`of ${data ? parseFloat(data.ethDailyLimitFormatted).toFixed(6) : '0.000000'} BOT`}
            value={
              <AnimatedNumber
                value={data ? parseFloat(data.ethDailySpentFormatted) : NaN}
                flashColor={spentPercent >= 70 ? 'var(--orange)' : undefined}
              />
            }
          />
          <ProgressBar value={spentPercent} warn={70} danger={90} />
          {spentPercent >= 90 && (
            <div
              role="alert"
              className="flex items-center gap-1 font-mono text-caption font-bold text-red"
            >
              <span aria-hidden="true" className="animate-blink">
                ▲
              </span>{' '}
              DAILY LIMIT CRITICAL
            </div>
          )}
          {spentPercent >= 70 && spentPercent < 90 && (
            <div className="flex items-center gap-1 font-mono text-caption font-bold text-orange">
              <span aria-hidden="true">▲</span> LIMIT APPROACHING
            </div>
          )}
        </div>

        {/*
          Pending limit change. The second and last `.animated-border` on this route: a change counting
          down to unlock is a live process, and the rotation is what says so at a glance.
        */}
        {data?.pendingLimitChange && (
          <div
            style={
              {
                '--border-glow-from': '#ff6b35',
                '--border-glow-to': '#ffd700',
              } as React.CSSProperties
            }
            className="animated-border flex flex-col gap-2 rounded border border-orange/40 bg-orange/5 p-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant="orange">⏳ Pending Limit Change</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="New Per-TX"
                color="orange"
                value={`${parseFloat(data.pendingLimitChange.txLimitFormatted).toFixed(6)} BOT`}
              />
              <Stat
                label="New Daily"
                color="orange"
                value={`${parseFloat(data.pendingLimitChange.dailyLimitFormatted).toFixed(6)} BOT`}
              />
            </div>
            <div className="flex items-center gap-2 border-t border-orange/20 pt-2">
              <span className="font-mono text-micro uppercase tracking-wider text-text-muted">
                Unlocks in
              </span>
              <Countdown unlockTimeMs={data.pendingLimitChange.unlockTimeMs} />
            </div>
          </div>
        )}

        {!data?.pendingLimitChange && (
          <div className="flex items-center gap-2 font-mono text-caption text-text-muted">
            <span aria-hidden="true" className="text-green">
              ✓
            </span>{' '}
            No pending limit changes
          </div>
        )}
      </div>
    </Panel>
  );
}
