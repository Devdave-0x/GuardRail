import {
  OverviewPanel,
  SpendingLimitsPanel,
  TransactionHistoryPanel,
  WhitelistManagerPanel,
  TokenPolicyPanel,
  AgentChatPanel,
  GuardianControlPanel,
} from '@/components/panels';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-6">
      {/* Top row: Overview + Spending + Guardian */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <OverviewPanel />
        <SpendingLimitsPanel />
        <GuardianControlPanel />
      </div>

      {/* Middle row: Agent Chat + Whitelist */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AgentChatPanel />
        <WhitelistManagerPanel />
      </div>

      {/* Bottom row: Transaction History + Token Policy */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <TransactionHistoryPanel />
        </div>
        <TokenPolicyPanel />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pb-8 pt-4 font-mono text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span>GuardRail Dashboard</span>
          <span className="text-border-bright">|</span>
          <span>AgentWallet v1</span>
          <span className="text-border-bright">|</span>
          <a
            href="https://scan.bohr.life/address/0x2e86509caAdFbEbbe223E51ee7d70Fcb7ba60B01"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-bright"
          >
            0x2e86...0B01 ↗
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
          <span>BOT Chain Testnet</span>
        </div>
      </div>
    </div>
  );
}
