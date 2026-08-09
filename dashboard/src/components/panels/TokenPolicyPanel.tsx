'use client';

import { useEffect, useState, useCallback } from 'react';
import { Panel, Badge, ProgressBar, Button, Input } from '@/components/shared';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, AGENT_WALLET_ABI } from '@/lib/contract';
import { useContractState } from '@/hooks/useContractState';
import { parseEther, createPublicClient, fallback, http } from 'viem';
import { RPC_URLS, activeChain } from '@/lib/contract';
import { formatAddress } from '@/lib/utils';

interface TokenPolicyEntry {
  token: string;
  dailyLimit: string;
  dailySpent: string;
  lastReset: string;
  enabled: boolean;
  symbol?: string;
}

export function TokenPolicyPanel() {
  const { data: contractData, loading } = useContractState();
  const { address: walletAddress } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const [policies, setPolicies] = useState<TokenPolicyEntry[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [newToken, setNewToken] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [lookupToken, setLookupToken] = useState('');
  const [lookupResult, setLookupResult] = useState<TokenPolicyEntry | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const isGuardian = walletAddress?.toLowerCase() === contractData?.guardian?.toLowerCase();

  /*
   * AgentWallet has no "list all policies" function, so discover every token that's ever
   * had one via the TokenPolicySet/TokenPolicyRevoked events it emits, then read current
   * state for each. Without this, the panel only shows whatever's been manually looked up.
   */
  const fetchKnownPolicies = useCallback(async () => {
    setPoliciesLoading(true);
    try {
      const res = await fetch('/api/token-policies', { cache: 'no-store' });
      const json = await res.json();
      const fetched: TokenPolicyEntry[] = json.policies ?? [];
      setPolicies((prev) => {
        const merged = new Map(prev.map((p) => [p.token.toLowerCase(), p]));
        for (const policy of fetched) merged.set(policy.token.toLowerCase(), policy);
        return [...merged.values()];
      });
    } catch {
      // Non-fatal, manual lookup still works if the discovery scan fails.
    } finally {
      setPoliciesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnownPolicies();
  }, [fetchKnownPolicies]);

  const handleLookup = async () => {
    if (!lookupToken) return;
    setLookupLoading(true);
    try {
      const client = createPublicClient({
        chain: activeChain,
        transport: fallback(RPC_URLS.map((url) => http(url))),
      });
      const result = (await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'tokenPolicy',
        args: [lookupToken as `0x${string}`],
      })) as [bigint, bigint, bigint, boolean];
      const [dailyLimit, dailySpent, lastReset, enabled] = result;
      setLookupResult({
        token: lookupToken,
        dailyLimit: dailyLimit.toString(),
        dailySpent: dailySpent.toString(),
        lastReset: lastReset.toString(),
        enabled,
      });
      if (enabled && !policies.find((p) => p.token.toLowerCase() === lookupToken.toLowerCase())) {
        setPolicies((prev) => [
          ...prev,
          {
            token: lookupToken,
            dailyLimit: dailyLimit.toString(),
            dailySpent: dailySpent.toString(),
            lastReset: lastReset.toString(),
            enabled,
          },
        ]);
      }
    } catch (err) {
      setTxStatus(`Lookup error: ${String(err).slice(0, 60)}`);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSetPolicy = async () => {
    if (!newToken || !newLimit) return;
    try {
      setTxStatus('Setting policy...');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'setTokenPolicy',
        args: [newToken as `0x${string}`, parseEther(newLimit)],
      });
      setTxStatus('✓ Token policy set.');
      setNewToken('');
      setNewLimit('');
      fetchKnownPolicies();
    } catch (err) {
      setTxStatus(`Error: ${String(err).slice(0, 80)}`);
    }
  };

  const handleRevoke = async (token: string) => {
    try {
      setTxStatus('Revoking...');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'revokeTokenPolicy',
        args: [token as `0x${string}`],
      });
      setTxStatus('✓ Policy revoked.');
      fetchKnownPolicies();
    } catch (err) {
      setTxStatus(`Error: ${String(err).slice(0, 80)}`);
    }
  };

  return (
    <Panel title="Token Policy" subtitle="ERC-20 daily spend limits" loading={loading}>
      <div className="flex flex-col gap-4 p-4">
        {/* Lookup section */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-micro uppercase tracking-wider text-text-muted">
            Lookup Token Policy
          </p>
          <div className="flex gap-2">
            <input
              value={lookupToken}
              onChange={(e) => setLookupToken(e.target.value)}
              placeholder="Token contract address (0x...)"
              className="flex-1 rounded border border-border bg-bg-elevated px-3 py-1.5 font-mono text-caption text-text-primary placeholder-text-muted focus:border-green/50 focus:outline-none"
            />
            <Button variant="ghost" size="sm" onClick={handleLookup} loading={lookupLoading}>
              Lookup
            </Button>
          </div>
        </div>

        {/* Lookup result */}
        {lookupResult && (
          <div
            className={`flex flex-col gap-2 rounded border p-3 ${lookupResult.enabled ? 'border-green/30 bg-green/5' : 'border-border bg-bg-elevated'}`}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-caption text-text-muted">
                {formatAddress(lookupResult.token)}
              </p>
              <Badge variant={lookupResult.enabled ? 'green' : 'gray'}>
                {lookupResult.enabled ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
            {lookupResult.enabled && (
              <>
                <ProgressBar
                  value={
                    BigInt(lookupResult.dailyLimit) > BigInt(0)
                      ? Number(
                          (BigInt(lookupResult.dailySpent) * BigInt(10_000)) /
                            BigInt(lookupResult.dailyLimit),
                        ) / 100
                      : 0
                  }
                  label="Daily spend"
                />
                <div className="font-mono text-caption text-text-muted">
                  {lookupResult.dailySpent} / {lookupResult.dailyLimit} wei
                </div>
              </>
            )}
            {isGuardian && lookupResult.enabled && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRevoke(lookupResult.token)}
                loading={isPending}
              >
                Revoke Policy
              </Button>
            )}
          </div>
        )}

        {/* Tracked policies */}
        {policiesLoading && policies.length === 0 && (
          <div className="font-mono text-caption text-text-muted">
            Scanning for token policies...
          </div>
        )}

        {!policiesLoading && policies.filter((p) => p.enabled).length === 0 && (
          <div className="flex items-center gap-2 font-mono text-caption text-text-muted">
            <span className="text-green">✓</span> No active token policies
          </div>
        )}

        {policies.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-micro uppercase tracking-wider text-text-muted">
              Active Policies
            </p>
            {policies
              .filter((p) => p.enabled)
              .map((policy) => (
                <div
                  key={policy.token}
                  className="flex flex-col gap-2 rounded border border-green/20 bg-green/5 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-caption text-text-primary">
                      {formatAddress(policy.token)}
                    </span>
                    <Badge variant="green">Active</Badge>
                  </div>
                  <ProgressBar
                    value={
                      BigInt(policy.dailyLimit) > BigInt(0)
                        ? Number(
                            (BigInt(policy.dailySpent) * BigInt(10_000)) /
                              BigInt(policy.dailyLimit),
                          ) / 100
                        : 0
                    }
                  />
                  {isGuardian && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRevoke(policy.token)}
                      loading={isPending}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Guardian: set new policy */}
        {isGuardian && (
          <div className="flex flex-col gap-3 rounded border border-border p-3">
            <p className="font-mono text-micro uppercase tracking-wider text-text-secondary">
              Set Token Policy
            </p>
            <Input
              label="Token Address"
              value={newToken}
              onChange={setNewToken}
              placeholder="0x..."
            />
            <Input
              label="Daily Limit (BOT units)"
              value={newLimit}
              onChange={setNewLimit}
              placeholder="100.0"
              type="number"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSetPolicy}
              disabled={!newToken || !newLimit || isPending}
              loading={isPending}
            >
              Set Policy
            </Button>
          </div>
        )}

        {txStatus && (
          <div
            className={`rounded border px-3 py-2 font-mono text-caption ${
              txStatus.startsWith('✓')
                ? 'border-green/30 bg-green/5 text-green'
                : 'border-orange/30 bg-orange/5 text-orange'
            }`}
          >
            {txStatus}
          </div>
        )}
      </div>
    </Panel>
  );
}
