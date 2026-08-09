import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, fallback, http } from 'viem';
import { getRpcUrl, requirePrivateKey } from './env.js';
import { getChain, getFallbackRpcUrls } from './chain.js';

const chain = getChain();

const PRIMARY_RPC = getRpcUrl();
const FALLBACK_RPCS = getFallbackRpcUrls();

function uniqueRpcUrls(urls: string[]): string[] {
  return [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
}

export const rpcUrls = uniqueRpcUrls([PRIMARY_RPC, ...FALLBACK_RPCS]);

const transport = fallback(
  rpcUrls.map((url) =>
    http(url, {
      timeout: 15_000,
      retryCount: 2,
      retryDelay: 250,
    }),
  ),
);

export const publicClient = createPublicClient({
  chain,
  transport,
});

export const agentAccount = privateKeyToAccount(requirePrivateKey('AGENT_PRIVATE_KEY'));

export const walletClient = createWalletClient({
  account: agentAccount,
  chain,
  transport,
});

export function getExplorerTxUrl(txHash: `0x${string}`): string {
  const base = chain.blockExplorers?.default.url ?? 'https://sepolia.etherscan.io';
  return `${base}/tx/${txHash}`;
}
