import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { requireAddress, requirePrivateKey, getRpcUrl } from './env.js';
import { getChain } from './chain.js';

const CONTRACT = requireAddress('AGENT_CONTRACT_ADDRESS');
const ABI = [
  {
    inputs: [],
    name: 'applyCall',
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
  },
] as const;

async function applySetup() {
  const guardian = privateKeyToAccount(requirePrivateKey('GUARDIAN_PRIVATE_KEY'));
  const client = createWalletClient({
    account: guardian,
    chain: getChain(),
    transport: http(getRpcUrl()),
  });
  const tx = await client.writeContract({
    address: CONTRACT,
    abi: ABI,
    functionName: 'applyCall',
    args: [],
  });
  console.error('✅ Call whitelist applied, tx:', tx);
}

applySetup().catch(console.error);
