'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Panel, Badge } from '@/components/shared';
import { useEvents } from '@/hooks/useEvents';
import { formatAddress, formatETH, formatSelector, getEtherscanLink } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function TransactionHistoryPanel() {
  const { events, loading, error, refetch } = useEvents(50, 60000);
  const [filter, setFilter] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = filter
    ? events.filter(
        (e) =>
          e.target.toLowerCase().includes(filter.toLowerCase()) ||
          e.selector.toLowerCase().includes(filter.toLowerCase()) ||
          e.action.toLowerCase().includes(filter.toLowerCase()) ||
          e.txHash.toLowerCase().includes(filter.toLowerCase()),
      )
    : events;

  return (
    <Panel
      title="Transaction History"
      subtitle="On-chain wallet events"
      status={error ? 'warn' : 'ok'}
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
      <div className="flex h-full flex-col">
        {/* Filter bar */}
        <div className="border-b border-border px-4 py-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by target, action, selector, or tx hash..."
            className="w-full rounded border border-border bg-bg-elevated px-3 py-1.5 font-mono text-xs text-text-primary placeholder-text-muted transition-colors focus:border-green/50 focus:outline-none"
          />
        </div>

        {error && (
          <div className="border-b border-border px-4 py-2 font-mono text-xs text-red">
            Error: {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center font-mono text-xs text-text-muted">
              {loading ? 'Loading...' : 'No transactions found'}
            </div>
          ) : (
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-normal uppercase tracking-wider text-text-muted">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left font-normal uppercase tracking-wider text-text-muted">
                    Target
                  </th>
                  <th className="px-4 py-2 text-left font-normal uppercase tracking-wider text-text-muted">
                    Value
                  </th>
                  <th className="px-4 py-2 text-left font-normal uppercase tracking-wider text-text-muted">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left font-normal uppercase tracking-wider text-text-muted">
                    Tx
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, i) => (
                  <tr
                    key={`${event.txHash}-${event.logIndex}`}
                    className="animate-fade-in border-b border-border/50 transition-colors hover:bg-bg-elevated"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td
                      className="whitespace-nowrap px-4 py-2 text-text-muted"
                      suppressHydrationWarning
                    >
                      {mounted && event.timestamp
                        ? formatDistanceToNow(new Date(event.timestamp * 1000), { addSuffix: true })
                        : `#${event.blockNumber}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-text-primary">
                      <a
                        href={getEtherscanLink(event.target, 'address')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1 transition-colors hover:text-blue-bright"
                      >
                        {formatAddress(event.target)}
                        <ExternalLink size={9} className="opacity-0 group-hover:opacity-100" />
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      {event.value !== '0' ? (
                        <span className="text-green">{formatETH(BigInt(event.value))} BOT</span>
                      ) : (
                        <span className="text-text-muted">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {event.action === 'Executed' ? (
                        event.selector === '0x00000000' ? (
                          <Badge variant="blue">BOT Transfer</Badge>
                        ) : (
                          <span className="text-text-secondary">
                            {formatSelector(event.selector)}
                          </span>
                        )
                      ) : (
                        <Badge variant="green">{event.action}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {event.txHash ? (
                        <a
                          href={getEtherscanLink(event.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1 text-blue-bright hover:underline"
                        >
                          {event.txHash.slice(0, 8)}...
                          <ExternalLink size={9} className="opacity-0 group-hover:opacity-100" />
                        </a>
                      ) : (
                        <span className="text-text-muted">pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between border-t border-border px-4 py-2 font-mono text-xs text-text-muted">
          <span>{filtered.length} events</span>
          <span>Auto-refresh: 60s</span>
        </div>
      </div>
    </Panel>
  );
}
