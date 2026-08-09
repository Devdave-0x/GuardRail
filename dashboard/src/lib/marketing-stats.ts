import type { GuardFeature, MarketingStat, McpTool, NavItem } from '@/types';

/*
  Derived constants for the marketing route. These are facts from the deployed contract
  and the README, not network reads, so they render without an RPC round trip. Live
  figures come from /api/contract instead. See the stats section of docs/Context.md.
*/

// === Chains

export const CHAIN_COUNT = 2;

export const DEPLOYMENTS = [
  {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    address: '0x4fbE2CeFEC5ef766634C83CFAd0338fEfBB65b35',
    explorer: 'https://sepolia.etherscan.io/address/0x4fbE2CeFEC5ef766634C83CFAd0338fEfBB65b35',
  },
  {
    name: 'BOT Chain testnet',
    chainId: 968,
    address: '0x2e86509caAdFbEbbe223E51ee7d70Fcb7ba60B01',
    explorer: 'https://scan.bohr.life/address/0x2e86509caAdFbEbbe223E51ee7d70Fcb7ba60B01',
  },
] as const;

// === Guards

export const GUARDS: readonly GuardFeature[] = [
  {
    id: 'per-tx-limit',
    title: 'Per-transaction limit',
    description: 'A hard ceiling on the value of any single transfer, enforced in the contract.',
    icon: 'gauge',
    accent: 'orange',
  },
  {
    id: 'daily-limit',
    title: 'Daily limit',
    description: 'A rolling daily cap on native-token spend that resets on a fixed schedule.',
    icon: 'calendar-clock',
    accent: 'yellow',
  },
  {
    id: 'whitelist',
    title: 'Target whitelist',
    description: 'The agent can only call addresses and function selectors you have approved.',
    icon: 'list-checks',
    accent: 'pink',
  },
  {
    id: 'token-policy',
    title: 'Token policy',
    description: 'Per-ERC-20 daily limits, set and revoked independently of native-token rules.',
    icon: 'coins',
    accent: 'cyan',
  },
  {
    id: 'guardian',
    title: 'Guardian kill switch',
    description: 'A separate guardian role can pause every agent action instantly.',
    icon: 'shield-alert',
    accent: 'red',
  },
  {
    id: 'timelock',
    title: 'Timelock',
    description: 'Limit increases and new whitelist entries queue behind a delay you can cancel.',
    icon: 'timer',
    accent: 'violet',
  },
];

export const GUARD_COUNT = GUARDS.length;

// === MCP tools

/*
  Accents follow meaning, not order: reads are green, value-moving writes are blue and
  cyan, lookups are violet and pink, and the guard-adjacent tools take orange and yellow.
*/
export const MCP_TOOLS: readonly McpTool[] = [
  {
    name: 'get_wallet_state',
    description: 'Balance, limits, paused status, roles',
    icon: 'wallet',
    accent: 'green',
  },
  {
    name: 'transfer_eth',
    description: 'Send native token to a whitelisted address',
    icon: 'send',
    accent: 'blue',
  },
  {
    name: 'transfer_token',
    description: 'Send ERC-20 within its token policy',
    icon: 'coins',
    accent: 'cyan',
  },
  {
    name: 'check_limits',
    description: 'Remaining daily native-token allowance',
    icon: 'gauge',
    accent: 'orange',
  },
  {
    name: 'get_tx_status',
    description: 'Look up a transaction by hash',
    icon: 'search',
    accent: 'violet',
  },
  {
    name: 'check_whitelist',
    description: 'Check if an address and action are allowed',
    icon: 'list-checks',
    accent: 'pink',
  },
  {
    name: 'get_pending_actions',
    description: 'Queued calls with countdown timers',
    icon: 'timer',
    accent: 'yellow',
  },
  {
    name: 'get_transaction_history',
    description: 'Recent on-chain activity',
    icon: 'history',
    accent: 'green',
  },
];

export const MCP_TOOL_COUNT = MCP_TOOLS.length;

// === Timelock

/*
  TIMELOCK is a compile-time constant in AgentWallet, so it differs per deployment:
  10 minutes on Sepolia, 1 minute on the BOT Chain testnet deployment where it was
  shortened for faster demo iteration. The marketing figure quotes the Sepolia value.
*/
export const TIMELOCK_MINUTES = 10;

// === Stat band

export const DERIVED_STATS: readonly MarketingStat[] = [
  { id: 'tools', label: 'Agent tools', value: MCP_TOOL_COUNT, suffix: '' },
  { id: 'chains', label: 'EVM chains', value: CHAIN_COUNT, suffix: '' },
  { id: 'guards', label: 'On-chain guards', value: GUARD_COUNT, suffix: '' },
  { id: 'timelock', label: 'Timelock', value: TIMELOCK_MINUTES, suffix: 'min' },
];

// === Navigation

export const MARKETING_NAV: readonly NavItem[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Guards', href: '#guards' },
  { label: 'Developers', href: '#quickstart' },
];

export const GITHUB_URL = 'https://github.com/Devdave-0x/GuardRail';
