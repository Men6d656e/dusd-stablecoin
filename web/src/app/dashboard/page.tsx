"use client";

import { keepPreviousData } from "@tanstack/react-query";
import type { Address } from "viem";
import { useBlockNumber, useConnection } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useReadDUsdBalanceOf,
  useReadDUsdTotalSupply,
  useReadMockUsdcBalanceOf,
  useReadReserveVaultSurplus,
  useReadReserveVaultTotalAssets,
  useReadReserveVaultTotalDeposits,
} from "@/generated/contracts";
import { contracts } from "@/lib/contracts";
import { backingRatioBps, formatCollateral, formatDusd } from "@/lib/format";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export default function DashboardPage() {
  const { address, isConnected, chainId } = useConnection();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const account = address ?? ZERO_ADDRESS;
  const onRightChain = chainId === baseSepolia.id;
  const ready = Boolean(address) && onRightChain && blockNumber !== undefined;

  // keepPreviousData keeps the last successful read visible while a new block
  // is fetched. Without it every block change produced an empty cache entry,
  // the grid was replaced by the loading text, and the page visibly blinked.
  const usdcBalance = useReadMockUsdcBalanceOf({
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const dusdBalance = useReadDUsdBalanceOf({
    args: [account],
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const totalSupply = useReadDUsdTotalSupply({
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const totalAssets = useReadReserveVaultTotalAssets({
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const totalDeposits = useReadReserveVaultTotalDeposits({
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });
  const surplus = useReadReserveVaultSurplus({
    blockNumber,
    query: { enabled: ready, placeholderData: keepPreviousData },
  });

  const reads = [
    usdcBalance,
    dusdBalance,
    totalSupply,
    totalAssets,
    totalDeposits,
    surplus,
  ];
  const error = reads.find((read) => read.error)?.error;

  // "Loading" is a first-paint concept only. Once any value has arrived, the
  // grid stays mounted for the rest of the session; refetches are reported by
  // the small "Updating" line instead of replacing the cards.
  const hasData = reads.some((read) => read.data !== undefined);
  const isInitialLoading = ready && !hasData;
  const isUpdating = ready && hasData && reads.some((read) => read.isFetching);

  if (!isConnected) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-neutral-500">
          Connect a wallet to read your position.
        </p>
      </section>
    );
  }

  if (!onRightChain) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-red-600">Switch to Base Sepolia to read balances.</p>
      </section>
    );
  }

  if (error && !hasData) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-red-600">{error.message}</p>
      </section>
    );
  }

  const supply = totalSupply.data ?? BigInt(0);
  const assets = totalAssets.data ?? BigInt(0);
  const ratio = backingRatioBps(assets, supply);

  const rows = [
    {
      label: "mUSDC balance",
      value: formatCollateral(usdcBalance.data ?? BigInt(0)),
    },
    { label: "dUSD balance", value: formatDusd(dusdBalance.data ?? BigInt(0)) },
    { label: "dUSD total supply", value: formatDusd(supply) },
    { label: "Vault assets", value: formatCollateral(assets) },
    {
      label: "Vault deposits",
      value: formatCollateral(totalDeposits.data ?? BigInt(0)),
    },
    { label: "Surplus", value: formatCollateral(surplus.data ?? BigInt(0)) },
    {
      label: "Backing ratio",
      value: `${(Number(ratio) / 100).toFixed(2)}%`,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {isUpdating ? (
          <p
            data-testid="dashboard-updating"
            className="text-xs text-neutral-500"
            aria-live="polite"
          >
            Updating…
          </p>
        ) : null}
      </div>
      {isInitialLoading ? (
        <p className="text-neutral-500">Reading chain…</p>
      ) : (
        <div
          data-testid="dashboard-grid"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rows.map((row) => (
            <Card key={row.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-neutral-500">
                  {row.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl">{row.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && hasData ? (
        <p className="text-sm text-red-600">
          The last refresh failed; showing the previous block. {error.message}
        </p>
      ) : null}
      <div className="rounded-md border border-neutral-200 p-4 text-xs text-neutral-600 dark:border-neutral-800">
        <p>
          Values from Base Sepolia block{" "}
          <span data-testid="dashboard-block" className="font-mono">
            {blockNumber?.toString() ?? "…"}
          </span>
          . Reproduce them with:
        </p>
        <pre className="mt-2 overflow-x-auto font-mono">
          {`cast call ${contracts.dUSD} "totalSupply()(uint256)" --rpc-url https://sepolia.base.org --block ${blockNumber?.toString() ?? "<block>"}`}
        </pre>
      </div>
    </section>
  );
}
