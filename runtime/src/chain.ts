import type { Chain } from 'viem';
import { sepolia } from 'viem/chains';
import { getChainId } from './env.js';

export const botChainTestnet: Chain = {
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain Explorer', url: 'https://scan.bohr.life' },
  },
  testnet: true,
};

// Chain ID, RPC, and explorer confirmed against BOT Chain's own dev docs
// (dev-docs.botchain.ai/docs/Developers/quick-guide), not guessed.
export const botChainMainnet: Chain = {
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: { name: 'BOTScan', url: 'https://scan.botchain.ai' },
  },
};

const SUPPORTED_CHAINS: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [botChainTestnet.id]: botChainTestnet,
  [botChainMainnet.id]: botChainMainnet,
};

const FALLBACK_RPCS: Record<number, string[]> = {
  [sepolia.id]: ['https://rpc.ankr.com/eth_sepolia', 'https://sepolia.drpc.org'],
};

export function getChain(): Chain {
  const chainId = getChainId();
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) {
    const supported = Object.keys(SUPPORTED_CHAINS).join(', ');
    throw new Error(`Unsupported CHAIN_ID=${chainId}. This runtime supports: ${supported}.`);
  }
  return chain;
}

export function getFallbackRpcUrls(): string[] {
  return FALLBACK_RPCS[getChainId()] ?? [];
}

export function getExplorerTxUrl(txHash: `0x${string}`): string {
  const chain = getChain();
  const base = chain.blockExplorers?.default.url ?? 'https://sepolia.etherscan.io';
  return `${base}/tx/${txHash}`;
}
