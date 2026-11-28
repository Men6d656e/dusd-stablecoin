"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import {
  useBlockNumber,
  useConnection,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type TxState, TxStatus } from "@/components/TxStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useReadCompliancePolicyIsAllowed,
  useReadDUsdBalanceOf,
  useReadDUsdTotalSupply,
  useReadMintRedeemControllerScale,
  useReadMockUsdcAllowance,
  useReadMockUsdcBalanceOf,
  useReadReserveVaultDeposits,
  useReadReserveVaultTotalAssets,
  useSimulateMintRedeemControllerMint,
  useSimulateMockUsdcApprove,
  useWriteMintRedeemControllerMint,
  useWriteMockUsdcApprove,
} from "@/generated/contracts";
import { contracts } from "@/lib/contracts";
import { formatCollateral, formatDusd } from "@/lib/format";
import {
  amountIssueMessage,
  DEFAULT_CONTROLLER_SCALE,
  dusdForCollateral,
  formatCollateralInput,
  formatDusdInput,
  mintErrorMessage,
  needsApproval,
  parseCollateralInput,
  previewBackingRatioBps,
} from "@/lib/mint";
import { activeChain, activeNetworkConfig } from "@/lib/networks";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

/**
 * W5 money path. Two transactions, in this order:
 *
 *   1. mUSDC.approve(vault, amount) — the vault pulls collateral itself, so the
 *      spender is the vault, never the controller.
 *   2. controller.mint(amount) — deposits into the vault and mints dUSD 1:1.
 *
 * Both transactions are simulated before the button enables, and both keep
 * their own status strip so the two explorer links are visible separately.
 */
export function MintPanel() {
  const { address, isConnected, chainId } = useConnection();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const onRightChain = chainId === activeChain.id;
  const account = (address ?? ZERO_ADDRESS) as Address;
  const ready = Boolean(address) && onRightChain && blockNumber !== undefined;

  const [amountInput, setAmountInput] = useState("");
  const [minted, setMinted] = useState<{ dusd: bigint } | null>(null);
  const [pendingMint, setPendingMint] = useState<{ dusd: bigint } | null>(null);
  const [settledApproveHash, setSettledApproveHash] = useState<string | null>(
    null,
  );
  const [settledMintHash, setSettledMintHash] = useState<string | null>(null);

  const balance = useReadMockUsdcBalanceOf({
    address: contracts.MockUSDC,
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const allowance = useReadMockUsdcAllowance({
    address: contracts.MockUSDC,
    args: [account, contracts.ReserveVault],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const dusdBalance = useReadDUsdBalanceOf({
    address: contracts.dUSD,
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const supply = useReadDUsdTotalSupply({
    address: contracts.dUSD,
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const assets = useReadReserveVaultTotalAssets({
    address: contracts.ReserveVault,
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const vaultDeposit = useReadReserveVaultDeposits({
    address: contracts.ReserveVault,
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const scaleRead = useReadMintRedeemControllerScale({
    address: contracts.MintRedeemController,
    query: { enabled: ready },
  });
  const allowed = useReadCompliancePolicyIsAllowed({
    address: contracts.CompliancePolicy,
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });

  const parsed = parseCollateralInput(amountInput);
  const amount = parsed.ok ? parsed.value : BigInt(0);
  const scale = scaleRead.data ?? DEFAULT_CONTROLLER_SCALE;
  const balanceValue = balance.data;
  const overBalance =
    parsed.ok && balanceValue !== undefined && amount > balanceValue;
  const approvalNeeded =
    parsed.ok && needsApproval(allowance.data ?? BigInt(0), amount);
  const policyAllowed = allowed.data === true;

  const approveSimulation = useSimulateMockUsdcApprove({
    address: contracts.MockUSDC,
    args: [contracts.ReserveVault, amount],
    query: {
      enabled:
        ready && parsed.ok && !overBalance && policyAllowed && approvalNeeded,
    },
  });
  const mintSimulation = useSimulateMintRedeemControllerMint({
    address: contracts.MintRedeemController,
    args: [amount],
    query: {
      enabled:
        ready && parsed.ok && !overBalance && policyAllowed && !approvalNeeded,
    },
  });

  const approveWrite = useWriteMockUsdcApprove();
  const approveReceipt = useWaitForTransactionReceipt({
    hash: approveWrite.data,
  });
  const mintWrite = useWriteMintRedeemControllerMint();
  const mintReceipt = useWaitForTransactionReceipt({ hash: mintWrite.data });

  const approveError =
    approveWrite.error ?? approveReceipt.error ?? approveSimulation.error;
  const mintError =
    mintWrite.error ?? mintReceipt.error ?? mintSimulation.error;
  // A failed allowance or policy read must not be silently read as "no
  // allowance" / "blocked": that would either loop the user through redundant
  // approvals or disable the form with no explanation.
  const actionReadError = allowance.error ?? allowed.error;

  const busy =
    approveWrite.isPending ||
    approveReceipt.isLoading ||
    mintWrite.isPending ||
    mintReceipt.isLoading;

  const approveState: TxState = approveReceipt.isSuccess
    ? "confirmed"
    : approveError
      ? "failed"
      : approveWrite.isPending
        ? "wallet"
        : approveWrite.data
          ? "pending"
          : "idle";

  const mintState: TxState = mintReceipt.isSuccess
    ? "confirmed"
    : mintError
      ? "failed"
      : mintWrite.isPending
        ? "wallet"
        : mintWrite.data
          ? "pending"
          : "idle";

  // A confirmed approval changes what step 2 is allowed to do. Refetching the
  // two inputs explicitly makes the transition immediate instead of waiting for
  // the next block poll.
  useEffect(() => {
    if (
      approveReceipt.isSuccess &&
      approveWrite.data &&
      approveWrite.data !== settledApproveHash
    ) {
      setSettledApproveHash(approveWrite.data);
      void allowance.refetch();
      void balance.refetch();
    }
  }, [
    approveReceipt.isSuccess,
    approveWrite.data,
    settledApproveHash,
    allowance.refetch,
    balance.refetch,
  ]);

  // A confirmed mint resets the form and refreshes every number the page shows.
  useEffect(() => {
    if (
      mintReceipt.isSuccess &&
      mintWrite.data &&
      mintWrite.data !== settledMintHash
    ) {
      setSettledMintHash(mintWrite.data);
      setMinted(pendingMint);
      setPendingMint(null);
      setAmountInput("");
      void balance.refetch();
      void dusdBalance.refetch();
      void allowance.refetch();
      void supply.refetch();
      void assets.refetch();
      void vaultDeposit.refetch();
    }
  }, [
    mintReceipt.isSuccess,
    mintWrite.data,
    settledMintHash,
    pendingMint,
    balance.refetch,
    dusdBalance.refetch,
    allowance.refetch,
    supply.refetch,
    assets.refetch,
    vaultDeposit.refetch,
  ]);

  function onMax() {
    if (balanceValue === undefined) return;
    setAmountInput(formatCollateralInput(balanceValue));
  }

  function onApprove() {
    if (!approveSimulation.data) return;
    approveWrite.mutate(approveSimulation.data.request);
  }

  function onMint() {
    if (!mintSimulation.data) return;
    setPendingMint({ dusd: dusdForCollateral(amount, scale) });
    mintWrite.mutate(mintSimulation.data.request);
  }

  if (!isConnected) {
    return (
      <p className="text-neutral-500">
        Connect a wallet to mint dUSD with mUSDC collateral.
      </p>
    );
  }

  if (!onRightChain) {
    return (
      <p className="text-red-600">
        Switch to {activeNetworkConfig.label} to mint dUSD.
      </p>
    );
  }

  const issue = parsed.ok ? null : amountIssueMessage(parsed.issue);
  const projectedRatio =
    parsed.ok && assets.data !== undefined && supply.data !== undefined
      ? previewBackingRatioBps(assets.data, supply.data, amount, scale)
      : null;

  const actionDisabled =
    !parsed.ok ||
    overBalance ||
    !policyAllowed ||
    Boolean(actionReadError) ||
    busy ||
    (approvalNeeded
      ? approveSimulation.data === undefined
      : mintSimulation.data === undefined);

  const actionLabel = !parsed.ok
    ? "Enter an amount"
    : overBalance
      ? "Amount exceeds balance"
      : allowed.data === false
        ? "Address not allowed"
        : approvalNeeded
          ? `Approve ${formatCollateralInput(amount)} mUSDC`
          : `Mint ${formatDusdInput(dusdForCollateral(amount, scale))} dUSD`;

  // Once a mint succeeds the form is empty and both strips stay visible so the
  // two explorer links remain readable. Typing the next amount starts a new
  // cycle, at which point the old success strips would be misleading.
  const showStatuses = minted === null || amountInput.trim() === "";

  return (
    <div className="space-y-6" data-testid="mint-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Your mUSDC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl" data-testid="mint-musdc-balance">
              {balanceValue !== undefined
                ? formatCollateral(balanceValue)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Your dUSD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl" data-testid="mint-dusd-balance">
              {dusdBalance.data !== undefined
                ? formatDusd(dusdBalance.data)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Vault allowance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl" data-testid="mint-allowance">
              {allowance.data !== undefined
                ? formatCollateral(allowance.data)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Your vault deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">
              {vaultDeposit.data !== undefined
                ? formatCollateral(vaultDeposit.data)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Backing after mint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl">
              {projectedRatio !== null
                ? `${(Number(projectedRatio) / 100).toFixed(2)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="mint-amount" className="text-sm font-medium">
            Amount (mUSDC)
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="mint-amount"
              data-testid="mint-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="100.00"
              value={amountInput}
              aria-invalid={issue !== null || overBalance}
              aria-describedby="mint-amount-help"
              onChange={(event) => setAmountInput(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMax}
              disabled={!balanceValue}
            >
              Max
            </Button>
          </div>
          <p
            id="mint-amount-help"
            className={`text-xs ${issue || overBalance ? "text-red-600" : "text-neutral-500"}`}
          >
            {issue ??
              (overBalance && balanceValue !== undefined
                ? `You only have ${formatCollateral(balanceValue)} mUSDC.`
                : "1 mUSDC mints 1 dUSD. mUSDC has 6 decimals.")}
          </p>
        </div>

        {allowed.data === false ? (
          <p className="text-sm text-red-600" data-testid="mint-policy-error">
            This address is not allowed by the compliance policy, so it cannot
            mint dUSD. Ask the policy admin to allowlist it.
          </p>
        ) : null}

        {actionReadError ? (
          <p className="text-sm text-red-600" data-testid="mint-read-error">
            Could not read the allowance or compliance policy:{" "}
            {actionReadError.message}
          </p>
        ) : null}

        <Button
          onClick={approvalNeeded ? onApprove : onMint}
          disabled={actionDisabled}
          data-testid="mint-action"
        >
          {actionLabel}
        </Button>

        <p className="text-xs text-neutral-500">
          {approvalNeeded
            ? "Step 1 of 2 — approve the vault to pull mUSDC. The approval goes to the vault, not the controller."
            : "Step 2 of 2 — mint dUSD against the approved collateral. Compliance is checked on-chain before the deposit."}
        </p>

        <TxStatus
          state={showStatuses ? approveState : "idle"}
          hash={approveWrite.data}
          error={approveError ? mintErrorMessage(approveError) : undefined}
          labels={{
            wallet: "Confirm the approval in your wallet…",
            pending: "Approval submitted — waiting for the block…",
            confirmed: "Approval confirmed. The mint button is ready.",
            failed: "Approval failed.",
          }}
        />

        <TxStatus
          state={showStatuses ? mintState : "idle"}
          hash={mintWrite.data}
          error={mintError ? mintErrorMessage(mintError) : undefined}
          labels={{
            wallet: "Confirm the mint in your wallet…",
            pending: "Mint submitted — waiting for the block…",
            confirmed:
              minted !== null
                ? `Minted ${formatDusdInput(minted.dusd)} dUSD. Collateral is now in the vault.`
                : "Mint confirmed.",
            failed: "Mint failed.",
          }}
        />
      </div>
    </div>
  );
}
