"use client";

import { basescanTxUrl } from "@/lib/faucet";

export type TxState = "idle" | "wallet" | "pending" | "confirmed" | "failed";

const LABELS: Record<TxState, string> = {
  idle: "",
  wallet: "Confirm the claim in your wallet…",
  pending: "Claim submitted — waiting for the block…",
  confirmed: "Claim confirmed. 100.00 mUSDC minted to your wallet.",
  failed: "Claim failed.",
};

export function TxStatus({
  state,
  hash,
  error,
}: {
  state: TxState;
  hash?: `0x${string}`;
  error?: string;
}) {
  if (state === "idle") return null;

  const tone =
    state === "failed"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : state === "confirmed"
        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300";

  return (
    <div
      role="status"
      aria-live="polite"
      data-tx-state={state}
      className={`space-y-1 rounded-md border p-3 text-sm ${tone}`}
    >
      <p>{state === "failed" && error ? error : LABELS[state]}</p>
      {hash ? (
        <a
          href={basescanTxUrl(hash)}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-mono text-xs underline underline-offset-2"
        >
          View on Basescan ↗
        </a>
      ) : null}
    </div>
  );
}
