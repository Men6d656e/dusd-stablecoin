"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import {
  useBlockNumber,
  useConnection,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { type TxState, TxStatus } from "@/components/TxStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  tokenFaucetAbi,
  tokenFaucetAddress,
  useReadMockUsdcBalanceOf,
  useReadTokenFaucetAmount,
  useReadTokenFaucetCanClaim,
  useReadTokenFaucetCap,
  useReadTokenFaucetClaimed,
  useReadTokenFaucetCooldown,
  useReadTokenFaucetNextClaimAt,
} from "@/generated/contracts";
import {
  countdownSeconds,
  faucetErrorMessage,
  formatCountdown,
} from "@/lib/faucet";
import { formatCollateral } from "@/lib/format";

/** Wall clock in seconds, null until mounted so SSR and hydration agree. */
function useNowSeconds(): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function FaucetPanel() {
  const { address, isConnected, chainId } = useConnection();
  const onRightChain = chainId === baseSepolia.id;
  const now = useNowSeconds();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const account = (address ??
    "0x0000000000000000000000000000000000000000") as Address;
  const ready = Boolean(address) && onRightChain;

  const amount = useReadTokenFaucetAmount();
  const cooldown = useReadTokenFaucetCooldown();
  const cap = useReadTokenFaucetCap();
  const claimed = useReadTokenFaucetClaimed({
    args: [account],
    blockNumber,
    query: { enabled: ready },
  });
  const canClaim = useReadTokenFaucetCanClaim({
    args: [account],
    blockNumber,
    query: { enabled: ready },
  });
  const nextClaimAt = useReadTokenFaucetNextClaimAt({
    args: [account],
    blockNumber,
    query: { enabled: ready },
  });
  const balance = useReadMockUsdcBalanceOf({
    args: [account],
    blockNumber,
    query: { enabled: ready },
  });

  const simulation = useSimulateContract({
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
    functionName: "claim",
    query: { enabled: ready && canClaim.data === true },
  });

  const claim = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: claim.data });

  const failing = claim.error ?? simulation.error;
  const state: TxState = receipt.isSuccess
    ? "confirmed"
    : failing
      ? "failed"
      : claim.isPending
        ? "wallet"
        : claim.data
          ? "pending"
          : "idle";

  const remaining = now === null ? 0 : countdownSeconds(nextClaimAt.data, now);
  const claimable = canClaim.data === true && remaining === 0;
  const readyToSend = claimable && simulation.data !== undefined;
  const amountLabel = amount.data ? formatCollateral(amount.data) : "—";
  const cooldownHours = cooldown.data ? Number(cooldown.data) / 3600 : 24;

  function onClaim() {
    if (!simulation.data) return;
    claim.mutate(simulation.data.request);
  }

  if (!isConnected) {
    return (
      <p className="text-neutral-500">
        Connect a wallet to claim test mUSDC from the faucet.
      </p>
    );
  }

  if (!onRightChain) {
    return (
      <p className="text-red-600">Switch to Base Sepolia to use the faucet.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Claim amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">{amountLabel} mUSDC</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Your mUSDC balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">
              {balance.data !== undefined
                ? formatCollateral(balance.data)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Lifetime claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">
              {claimed.data !== undefined
                ? formatCollateral(claimed.data)
                : "—"}{" "}
              / {cap.data !== undefined ? formatCollateral(cap.data) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Cooldown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">{cooldownHours} h</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onClaim}
          disabled={!readyToSend || claim.isPending || receipt.isLoading}
        >
          {!claimable
            ? `Next claim in ${formatCountdown(remaining)}`
            : readyToSend
              ? `Claim ${amountLabel} mUSDC`
              : "Preparing claim…"}
        </Button>
        <p className="text-xs text-neutral-500">
          One claim per {cooldownHours} hours per address, capped at{" "}
          {cap.data ? formatCollateral(cap.data, 0) : "—"} mUSDC for the
          lifetime of the faucet. The countdown is read from the contract, so it
          survives a reload.
        </p>
        <TxStatus
          state={state}
          hash={claim.data}
          error={failing ? faucetErrorMessage(failing) : undefined}
        />
      </div>
    </div>
  );
}
