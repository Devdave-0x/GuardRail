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
    <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-panel-gap px-section-px py-section-py-tight">
      {/* Top row: Overview + Spending + Guardian */}
      <div className="grid grid-cols-1 gap-panel-gap lg:grid-cols-3">
        <OverviewPanel />
        <SpendingLimitsPanel />
        <GuardianControlPanel />
      </div>

      {/* Middle row: Agent Chat + Whitelist */}
      <div className="grid grid-cols-1 gap-panel-gap lg:grid-cols-2">
        <AgentChatPanel />
        <WhitelistManagerPanel />
      </div>

      {/* Bottom row: Transaction History + Token Policy */}
      <div className="grid grid-cols-1 gap-panel-gap lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionHistoryPanel />
        </div>
        <TokenPolicyPanel />
      </div>
    </div>
  );
}
