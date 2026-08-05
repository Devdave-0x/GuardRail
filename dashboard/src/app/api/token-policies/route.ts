import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { CONTRACT_ADDRESS, RPC_URLS, AGENT_WALLET_ABI, botChainTestnet } from '@/lib/contract';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// AgentWallet has no on-chain function to list every token that's ever had a policy —
// the only way to discover them is to scan the events it emits when one is set/revoked,
// then read current state for each. Falls back to the deploy block if not overridden.
const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || '15562282');

const TOKEN_POLICY_SET_EVENT = parseAbiItem('event TokenPolicySet(address indexed token, uint256 dailyLimit)');
const TOKEN_POLICY_REVOKED_EVENT = parseAbiItem('event TokenPolicyRevoked(address indexed token)');

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET() {
  try {
    const clients = RPC_URLS.map((url) =>
      createPublicClient({ chain: botChainTestnet, transport: http(url, { timeout: 12_000, retryCount: 1 }) })
    );

    const withFallback = async <T,>(fn: (client: (typeof clients)[number]) => Promise<T>): Promise<T> => {
      let lastError: unknown;
      for (const client of clients) {
        try {
          return await fn(client);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError ?? new Error('All RPC providers failed');
    };

    const latestBlock = await withFallback((client) => client.getBlockNumber());

    const [setLogs, revokedLogs] = await Promise.all([
      withFallback((client) =>
        client.getLogs({ address: CONTRACT_ADDRESS, event: TOKEN_POLICY_SET_EVENT, fromBlock: DEPLOY_BLOCK, toBlock: latestBlock })
      ),
      withFallback((client) =>
        client.getLogs({ address: CONTRACT_ADDRESS, event: TOKEN_POLICY_REVOKED_EVENT, fromBlock: DEPLOY_BLOCK, toBlock: latestBlock })
      ),
    ]);

    const tokens = new Set<string>();
    for (const log of setLogs) {
      if (log.args.token) tokens.add(log.args.token.toLowerCase());
    }
    for (const log of revokedLogs) {
      if (log.args.token) tokens.add(log.args.token.toLowerCase());
    }

    const policies = await Promise.all(
      [...tokens].map(async (token) => {
        const result = (await withFallback((client) =>
          client.readContract({
            address: CONTRACT_ADDRESS,
            abi: AGENT_WALLET_ABI,
            functionName: 'tokenPolicy',
            args: [token as `0x${string}`],
          })
        )) as [bigint, bigint, bigint, boolean];
        const [dailyLimit, dailySpent, lastReset, enabled] = result;
        return {
          token,
          dailyLimit: dailyLimit.toString(),
          dailySpent: dailySpent.toString(),
          lastReset: lastReset.toString(),
          enabled,
        };
      })
    );

    return NextResponse.json({ policies, latestBlock: latestBlock.toString() });
  } catch (error) {
    console.error('[/api/token-policies]', errorMessage(error));
    return NextResponse.json({ policies: [], error: errorMessage(error) }, { status: 200 });
  }
}
