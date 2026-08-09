import { formatEther } from 'viem';
import { AGENT_WALLET_ABI, CONTRACT_ADDRESS } from './contract';
import { publicClient } from './utils';

export interface LiveContractStats {
  balance: string;
  txLimit: string;
  dailyLimit: string;
  dailySpent: string;
  dailySpentPercent: number;
  paused: boolean;
  /* True when the RPC could not be reached. The strip renders a degraded state. */
  unavailable: boolean;
}

const FALLBACK: LiveContractStats = {
  balance: '0',
  txLimit: '0',
  dailyLimit: '0',
  dailySpent: '0',
  dailySpentPercent: 0,
  paused: false,
  unavailable: true,
};

function format(value: bigint): string {
  return parseFloat(formatEther(value)).toFixed(4);
}

/*
  Server-side read for the marketing route's live proof strip.

  It talks to the chain through the shared viem client rather than fetching our own
  /api/contract over HTTP. A server component calling its own API route costs an extra
  round trip and breaks whenever the origin is not what the request thinks it is.

  Never throws. A dead RPC yields the zeroed fallback with `unavailable: true`, so the
  homepage degrades to static copy instead of failing to render.
*/
export async function getLiveContractStats(): Promise<LiveContractStats> {
  try {
    const [balance, txLimit, dailyLimit, dailySpent, paused] = await Promise.all([
      publicClient.getBalance({ address: CONTRACT_ADDRESS }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'ethTxLimit',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'ethDailyLimit',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'ethDailySpent',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'paused',
      }) as Promise<boolean>,
    ]);

    const percent =
      dailyLimit > BigInt(0) ? Number((dailySpent * BigInt(10000)) / dailyLimit) / 100 : 0;

    return {
      balance: format(balance),
      txLimit: format(txLimit),
      dailyLimit: format(dailyLimit),
      dailySpent: format(dailySpent),
      dailySpentPercent: percent,
      paused,
      unavailable: false,
    };
  } catch {
    return FALLBACK;
  }
}
