'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Pause,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { Panel, Badge, Button, Input } from '@/components/shared';
import { useContractState } from '@/hooks/useContractState';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, AGENT_WALLET_ABI } from '@/lib/contract';
import { parseEther } from 'viem';

type ActiveSection = 'none' | 'withdraw' | 'agent' | 'guardian' | 'limits';

export function GuardianControlPanel() {
  const { data, loading, refetch } = useContractState();
  const { address: walletAddress } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const [section, setSection] = useState<ActiveSection>('none');
  const [txStatus, setTxStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [withdrawTo, setWithdrawTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newAgent, setNewAgent] = useState('');
  const [newGuardian, setNewGuardian] = useState('');
  const [newTxLimit, setNewTxLimit] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGuardian = mounted && walletAddress?.toLowerCase() === data?.guardian?.toLowerCase();

  const exec = async (label: string, fn: () => Promise<unknown>) => {
    setTxStatus(null);
    try {
      setTxStatus({ msg: `${label}...`, ok: true });
      await fn();
      setTxStatus({ msg: `✓ ${label} successful`, ok: true });
      refetch();
    } catch (err) {
      setTxStatus({ msg: `Error: ${String(err).slice(0, 100)}`, ok: false });
    }
  };

  const handlePause = () =>
    exec('Pausing', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'pause',
      }),
    );

  const handleUnpause = () =>
    exec('Unpausing', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'unpause',
      }),
    );

  const handleWithdraw = () =>
    exec('Withdrawing', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'withdraw',
        args: [withdrawTo as `0x${string}`, parseEther(withdrawAmount)],
      }),
    );

  const handleTransferAgent = () =>
    exec('Transfer agent', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'transferAgent',
        args: [newAgent as `0x${string}`],
      }),
    );

  const handleTransferGuardian = () =>
    exec('Transfer guardian', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'transferGuardian',
        args: [newGuardian as `0x${string}`],
      }),
    );

  const handleQueueLimitChange = () =>
    exec('Queuing limit change', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'queueLimitChange',
        args: [parseEther(newTxLimit), parseEther(newDailyLimit)],
      }),
    );

  const handleApplyLimitChange = () =>
    exec('Applying limit change', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'applyLimitChange',
      }),
    );

  const handleCancelLimitChange = () =>
    exec('Cancelling limit change', () =>
      writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'cancelLimitChange',
      }),
    );

  if (!mounted) {
    return (
      <Panel
        title="Guardian Control"
        subtitle="Connect wallet to access"
        status="warn"
        loading={loading}
      >
        <div className="p-6 text-center">
          <ShieldAlert size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="font-mono text-xs text-text-muted">
            Connect guardian wallet to access controls
          </p>
        </div>
      </Panel>
    );
  }

  if (!walletAddress) {
    return (
      <Panel
        title="Guardian Control"
        subtitle="Connect wallet to access"
        status="warn"
        loading={loading}
      >
        <div className="p-6 text-center">
          <ShieldAlert size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="font-mono text-xs text-text-muted">
            Connect guardian wallet to access controls
          </p>
        </div>
      </Panel>
    );
  }

  if (!isGuardian) {
    return (
      <Panel
        title="Guardian Control"
        subtitle="Guardian access required"
        status="warn"
        loading={loading}
      >
        <div className="p-6 text-center">
          <ShieldAlert size={32} className="mx-auto mb-3 text-orange" />
          <p className="font-mono text-xs text-text-muted">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="mt-1 font-mono text-xs text-orange">Not the guardian address</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Guardian Control"
      subtitle="Privileged contract management"
      status={data?.paused ? 'error' : 'ok'}
      loading={loading}
    >
      <div className="space-y-4 p-4">
        {/* Guardian badge */}
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-green" />
          <Badge variant="green">Guardian Connected</Badge>
        </div>

        {/* Pause / Unpause */}
        <div className="space-y-2 rounded border border-border p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
            Emergency Controls
          </p>
          <div className="flex gap-2">
            {data?.paused ? (
              <Button variant="primary" onClick={handleUnpause} loading={isPending} size="sm">
                <span className="inline-flex items-center gap-1">
                  <Play size={12} /> Unpause Contract
                </span>
              </Button>
            ) : (
              <Button variant="danger" onClick={handlePause} loading={isPending} size="sm">
                <span className="inline-flex items-center gap-1">
                  <Pause size={12} /> Pause Contract
                </span>
              </Button>
            )}
          </div>
          {data?.paused && (
            <div className="flex items-center gap-2 font-mono text-xs text-red">
              <AlertTriangle size={12} className="animate-blink" /> CONTRACT IS PAUSED: agent cannot
              execute
            </div>
          )}
        </div>

        {/* Section buttons */}
        <div className="grid grid-cols-2 gap-2">
          {(['withdraw', 'agent', 'guardian', 'limits'] as ActiveSection[]).map((s) => (
            <Button
              key={s}
              variant={section === s ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSection(section === s ? 'none' : s)}
            >
              {s === 'withdraw' ? (
                <span className="inline-flex items-center gap-1">
                  <Send size={12} /> Withdraw
                </span>
              ) : s === 'agent' ? (
                <span className="inline-flex items-center gap-1">
                  <Bot size={12} /> Transfer Agent
                </span>
              ) : s === 'guardian' ? (
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} /> Transfer Guardian
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Zap size={12} /> Limits
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Withdraw form */}
        {section === 'withdraw' && (
          <div className="animate-slide-in space-y-3 rounded border border-orange/30 bg-orange/5 p-3">
            <Input
              label="Recipient Address"
              value={withdrawTo}
              onChange={setWithdrawTo}
              placeholder="0x..."
            />
            <Input
              label="Amount (BOT)"
              value={withdrawAmount}
              onChange={setWithdrawAmount}
              placeholder="0.01"
              type="number"
            />
            <Button
              variant="warn"
              size="sm"
              onClick={handleWithdraw}
              disabled={!withdrawTo || !withdrawAmount || isPending}
              loading={isPending}
            >
              Emergency Withdraw
            </Button>
          </div>
        )}

        {/* Transfer agent form */}
        {section === 'agent' && (
          <div className="animate-slide-in space-y-3 rounded border border-border p-3">
            <Input
              label="New Agent Address"
              value={newAgent}
              onChange={setNewAgent}
              placeholder="0x..."
            />
            <p className="font-mono text-xs text-text-muted">
              New agent must call acceptAgent() to complete transfer
            </p>
            <Button
              variant="warn"
              size="sm"
              onClick={handleTransferAgent}
              disabled={!newAgent || isPending}
              loading={isPending}
            >
              Initiate Agent Transfer
            </Button>
          </div>
        )}

        {/* Transfer guardian form */}
        {section === 'guardian' && (
          <div className="animate-slide-in space-y-3 rounded border border-red/30 bg-red/5 p-3">
            <p className="inline-flex items-center gap-1 font-mono text-xs text-red">
              <AlertTriangle size={12} /> CAUTION: New guardian must accept before this takes effect
            </p>
            <Input
              label="New Guardian Address"
              value={newGuardian}
              onChange={setNewGuardian}
              placeholder="0x..."
            />
            <Button
              variant="danger"
              size="sm"
              onClick={handleTransferGuardian}
              disabled={!newGuardian || isPending}
              loading={isPending}
            >
              Initiate Guardian Transfer
            </Button>
          </div>
        )}

        {/* Limits form */}
        {section === 'limits' && (
          <div className="animate-slide-in space-y-3 rounded border border-border p-3">
            <p className="font-mono text-xs text-text-muted">
              To increase limits, a 10-minute timelock applies
            </p>
            <Input
              label="New Per-TX Limit (BOT)"
              value={newTxLimit}
              onChange={setNewTxLimit}
              placeholder="0.01"
              type="number"
            />
            <Input
              label="New Daily Limit (BOT)"
              value={newDailyLimit}
              onChange={setNewDailyLimit}
              placeholder="0.1"
              type="number"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="warn"
                size="sm"
                onClick={handleQueueLimitChange}
                disabled={!newTxLimit || !newDailyLimit || isPending || !!data?.pendingLimitChange}
                loading={isPending}
              >
                Queue Change (+10min)
              </Button>
              {data?.pendingLimitChange && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyLimitChange}
                    loading={isPending}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancelLimitChange}
                    loading={isPending}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        {txStatus && (
          <div
            className={`rounded border px-3 py-2 font-mono text-xs ${
              txStatus.ok && txStatus.msg.startsWith('✓')
                ? 'border-green/30 bg-green/5 text-green'
                : txStatus.ok
                  ? 'border-border text-text-secondary'
                  : 'border-red/30 bg-red/5 text-red'
            }`}
          >
            {txStatus.msg}
          </div>
        )}
      </div>
    </Panel>
  );
}
