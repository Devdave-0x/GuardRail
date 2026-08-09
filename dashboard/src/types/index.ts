import type { IconType } from 'react-icons';

// Contract state types
export interface ContractState {
  address: string;
  balance: bigint;
  balanceFormatted: string;
  agent: string;
  guardian: string;
  paused: boolean;
  ethTxLimit: bigint;
  ethDailyLimit: bigint;
  ethDailySpent: bigint;
  ethTxLimitFormatted: string;
  ethDailyLimitFormatted: string;
  ethDailySpentFormatted: string;
  dailySpentPercent: number;
  pendingLimitChange: PendingLimitChange | null;
  pendingCall: PendingCallState | null;
  network: string;
  chainId: number;
}

export interface PendingLimitChange {
  txLimit: bigint;
  dailyLimit: bigint;
  unlockTime: bigint;
  queued: boolean;
  txLimitFormatted: string;
  dailyLimitFormatted: string;
  unlockTimeMs: number;
}

export interface PendingCallState {
  target: string;
  selector: string;
  checkRecipient: boolean;
  checkAmount: boolean;
  maxAmount: bigint;
  unlockTime: bigint;
  queued: boolean;
  unlockTimeMs: number;
}

export interface TokenPolicy {
  token: string;
  dailyLimit: bigint;
  dailySpent: bigint;
  lastReset: bigint;
  enabled: boolean;
  dailyLimitFormatted: string;
  dailySpentFormatted: string;
  spentPercent: number;
}

// Event types
export interface ExecutedEvent {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  target: string;
  value: string;
  selector: string;
  /* Human-readable label the events route derives from the event name and selector. */
  action: string;
  logIndex: number;
}

// Agent chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolResult?: string;
  txHash?: string;
  timestamp: number;
}

// SEO types
export interface SeoOptions {
  /* Page title. The root layout's template appends the site name. */
  title: string;
  description?: string;
  /* Appended to BASE_KEYWORDS, never replacing them. */
  keywords?: string[];
  /* Route path, used for the canonical URL and og:url. Leading slash. */
  path?: string;
  /* Absolute or root-relative OG image. Defaults to the generated /opengraph-image. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /* Set on anything behind a wallet connection. Dashboards should not be indexed. */
  noIndex?: boolean;
  /* ISO 8601. Only meaningful when type is 'article'. */
  publishedTime?: string;
}

// Marketing types
export interface MarketingStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  /* Set when the figure is read live from /api/contract rather than derived. */
  live?: boolean;
}

export interface GuardFeature {
  id: string;
  title: string;
  description: string;
  /* Icon name from react-icons/md, resolved by the consuming component. */
  icon: string;
  accent: Accent;
}

/*
  Accent hues available to icons and cards. Mapped to Tailwind classes in
  src/lib/accents.ts, which is the only place the class strings live.
*/
export type Accent = 'green' | 'blue' | 'cyan' | 'violet' | 'pink' | 'orange' | 'red' | 'yellow';

export interface AccentClasses {
  text: string;
  border: string;
  bg: string;
  /* Raw rgba, not a class: feeds --edge-glow-color on the cursor-tracking border. */
  glow: string;
}

/*
  Marketing content shapes. Declared here and applied at the definition
  (`const PROBLEMS: Problem[] = [...]`) rather than inferred with `as const`, so a missing
  or misspelled field is an error where the data is written instead of where it is read.
  That is also what removes the need for `as Accent` casts on every literal.
*/
export interface Problem {
  id: string;
  title: string;
  body: string;
  /* react-icons icon component, imported by the section that renders it. */
  icon: IconType;
  accent: Accent;
}

export interface FlowStep {
  id: string;
  label: string;
  detail: string;
}

export interface Capability {
  id: string;
  title: string;
  body: string;
  icon: IconType;
  accent: Accent;
}

export interface McpTool {
  name: string;
  description: string;
  /* Icon name from react-icons/md, resolved by the consuming component. */
  icon: string;
  accent: Accent;
}

/*
  One rendered row in a Terminal block. `prompt` is something the user types, `output` is
  what the shell prints back, `comment` is annotation that is neither.
*/
export interface TerminalLine {
  kind: 'prompt' | 'output' | 'comment';
  text: string;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  items: NavItem[];
}

// Guardian action types
export type GuardianAction =
  | { type: 'pause' }
  | { type: 'unpause' }
  | { type: 'withdraw'; to: string; amount: string }
  | { type: 'transferAgent'; newAgent: string }
  | { type: 'transferGuardian'; newGuardian: string }
  | {
      type: 'queueCall';
      target: string;
      selector: string;
      checkRecipient: boolean;
      checkAmount: boolean;
      maxAmount: string;
    }
  | { type: 'cancelCallQueue' }
  | { type: 'applyCall' }
  | { type: 'removeCall'; target: string; selector: string }
  | { type: 'queueLimitChange'; txLimit: string; dailyLimit: string }
  | { type: 'applyLimitChange' }
  | { type: 'cancelLimitChange' }
  | { type: 'setTokenPolicy'; token: string; dailyLimit: string }
  | { type: 'revokeTokenPolicy'; token: string };
