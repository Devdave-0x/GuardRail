'use client';

import { useEffect, useState } from 'react';
import { Panel, Badge, Countdown, Button, Input } from '@/components/shared';
import { useContractState } from '@/hooks/useContractState';
import { formatAddress } from '@/lib/utils';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, AGENT_WALLET_ABI } from '@/lib/contract';
import { parseUnits } from 'viem';

export function WhitelistManagerPanel() {
  const { data, loading, refetch } = useContractState();
  const { address: walletAddress } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const [queueTarget, setQueueTarget] = useState('');
  const [queueSelector, setQueueSelector] = useState('');
  const [queueCheckRecipient, setQueueCheckRecipient] = useState(false);
  const [queueCheckAmount, setQueueCheckAmount] = useState(false);
  const [queueMaxAmount, setQueueMaxAmount] = useState('0');
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(0);

  const isGuardian = walletAddress?.toLowerCase() === data?.guardian?.toLowerCase();

  const handleQueueCall = async () => {
    try {
      setTxStatus('Submitting...');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'queueCall',
        args: [
          queueTarget as `0x${string}`,
          queueSelector as `0x${string}`,
          queueCheckRecipient,
          queueCheckAmount,
          parseUnits(queueMaxAmount || '0', 18),
        ],
      });
      setTxStatus('✓ Call queued. Wait 10 minutes then apply.');
      setQueueTarget('');
      setQueueSelector('');
      refetch();
    } catch (err) {
      setTxStatus(`Error: ${String(err).slice(0, 80)}`);
    }
  };

  const handleApplyCall = async () => {
    try {
      setTxStatus('Applying...');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'applyCall',
      });
      setTxStatus('✓ Call applied successfully.');
      refetch();
    } catch (err) {
      setTxStatus(`Error: ${String(err).slice(0, 80)}`);
    }
  };

  const handleCancelQueue = async () => {
    try {
      setTxStatus('Cancelling...');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_WALLET_ABI,
        functionName: 'cancelCallQueue',
      });
      setTxStatus('✓ Queue cancelled.');
      refetch();
    } catch (err) {
      setTxStatus(`Error: ${String(err).slice(0, 80)}`);
    }
  };

  useEffect(() => {
    const update = () => setNowMs(Date.now());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = data?.pendingCall ? nowMs >= data.pendingCall.unlockTimeMs : false;

  return (
    <Panel
      title="Whitelist Manager"
      subtitle="Call policy queue (10min timelock)"
      status={data?.pendingCall ? 'warn' : 'ok'}
      loading={loading}
    >
      <div className="space-y-4 p-4">
        {/* Pending queued call */}
        {data?.pendingCall ? (
          <div className="space-y-3 rounded border border-orange/40 bg-orange/5 p-3">
            <div className="flex items-center justify-between">
              <Badge variant="orange">⏳ Queued Call</Badge>
              <Countdown unlockTimeMs={data.pendingCall.unlockTimeMs} />
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <p className="text-text-muted">Target</p>
                <p className="text-text-primary">{formatAddress(data.pendingCall.target)}</p>
              </div>
              <div>
                <p className="text-text-muted">Selector</p>
                <p className="text-text-primary">{data.pendingCall.selector}</p>
              </div>
              <div>
                <p className="text-text-muted">Check Recipient</p>
                <p className={data.pendingCall.checkRecipient ? 'text-green' : 'text-text-muted'}>
                  {data.pendingCall.checkRecipient ? 'YES' : 'NO'}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Max Amount</p>
                <p className="text-text-primary">
                  {data.pendingCall.checkAmount ? `${data.pendingCall.maxAmount} wei` : 'Unchecked'}
                </p>
              </div>
            </div>
            {isGuardian && (
              <div className="flex gap-2 border-t border-orange/20 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyCall}
                  disabled={!isUnlocked || isPending}
                  loading={isPending}
                >
                  Apply
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancelQueue}
                  disabled={isPending}
                  loading={isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <span className="text-green">✓</span> No pending call in queue
          </div>
        )}

        {/* Guardian: Queue new call form */}
        {isGuardian && !data?.pendingCall && (
          <div className="space-y-3 rounded border border-border p-3">
            <p className="font-mono text-xs uppercase tracking-wider text-text-secondary">
              Queue New Call
            </p>
            <Input
              label="Target Address"
              value={queueTarget}
              onChange={setQueueTarget}
              placeholder="0x..."
            />
            <Input
              label="Selector (bytes4)"
              value={queueSelector}
              onChange={setQueueSelector}
              placeholder="0x00000000"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={queueCheckRecipient}
                  onChange={(e) => setQueueCheckRecipient(e.target.checked)}
                  className="accent-green"
                />
                Check Recipient
              </label>
              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={queueCheckAmount}
                  onChange={(e) => setQueueCheckAmount(e.target.checked)}
                  className="accent-green"
                />
                Check Amount
              </label>
            </div>
            {queueCheckAmount && (
              <Input
                label="Max Amount (BOT)"
                value={queueMaxAmount}
                onChange={setQueueMaxAmount}
                placeholder="0.01"
                type="number"
              />
            )}
            <Button
              variant="warn"
              size="sm"
              onClick={handleQueueCall}
              disabled={!queueTarget || !queueSelector || isPending}
              loading={isPending}
            >
              Queue Call (10min timelock)
            </Button>
          </div>
        )}

        {!isGuardian && walletAddress && (
          <div className="font-mono text-xs text-text-muted">
            Connect guardian wallet to manage whitelist
          </div>
        )}

        {!walletAddress && (
          <div className="font-mono text-xs text-text-muted">
            Connect wallet to manage whitelist
          </div>
        )}

        {txStatus && (
          <div
            className={`rounded border px-3 py-2 font-mono text-xs ${
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
