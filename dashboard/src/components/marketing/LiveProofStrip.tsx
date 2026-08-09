import { getLiveContractStats } from '@/lib/contract-stats';
import { DEPLOYMENTS } from '@/lib/marketing-stats';
import { CONTRACT_ADDRESS } from '@/lib/contract';

// === Component

/*
  Server component. Reads the live contract directly so the numbers under the hero are
  real rather than marketing copy, and degrades to a stated "unavailable" rather than
  zeros presented as fact when the RPC is down.
*/
export async function LiveProofStrip() {
  const stats = await getLiveContractStats();
  const shortAddress = `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`;

  const entries: { label: string; value: string }[] = [
    { label: 'Vault balance', value: stats.unavailable ? 'Unavailable' : `${stats.balance} BOT` },
    { label: 'Per-tx limit', value: stats.unavailable ? 'Unavailable' : `${stats.txLimit} BOT` },
    { label: 'Daily limit', value: stats.unavailable ? 'Unavailable' : `${stats.dailyLimit} BOT` },
    { label: 'Status', value: stats.paused ? 'Paused' : 'Active' },
  ];

  return (
    <section
      aria-label="Live contract status"
      className="relative h-full w-full animate-fade-in border-y border-border bg-bg-panel motion-reduce:animate-none"
    >
      <div className="mx-auto flex w-full max-w-container flex-col gap-6 px-section-px py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${stats.unavailable ? 'bg-orange' : 'animate-pulse-green bg-green'}`}
          />
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
            {stats.unavailable ? 'Chain unreachable' : `Live on ${DEPLOYMENTS[1].name}`}
          </span>
          <a
            href={DEPLOYMENTS[1].explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded font-mono text-xs text-blue-bright transition-colors hover:text-green"
          >
            {shortAddress}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {entries.map((entry) => (
            <div key={entry.label} className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-wider text-text-muted">
                {entry.label}
              </dt>
              <dd className="font-mono text-sm font-bold text-green">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
