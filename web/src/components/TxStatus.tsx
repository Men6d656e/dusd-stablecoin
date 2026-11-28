"use client";

import { activeNetwork, explorerTxUrl } from "@/lib/networks";

export type TxState = "idle" | "wallet" | "pending" | "confirmed" | "failed";

const DEFAULT_TX_LABELS: Record<TxState, string> = {
  idle: "",
  wallet: "Confirm the transaction in your wallet…",
  pending: "Transaction submitted — waiting for the block…",
  confirmed: "Transaction confirmed.",
  failed: "Transaction failed.",
};

/**
 * One status strip for every write path. Callers pass action-specific copy so
 * "claim", "approve" and "mint" read correctly without three near-copies of the
 * same component.
 */
export function TxStatus({
  state,
  hash,
  error,
  labels,
}: {
  state: TxState;
  hash?: `0x${string}`;
  error?: string;
  labels?: Partial<Record<TxState, string>>;
}) {
  if (state === "idle") return null;

  const text = { ...DEFAULT_TX_LABELS, ...labels }[state];
  const href = hash ? explorerTxUrl(activeNetwork, hash) : null;

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
      <p>{state === "failed" && error ? error : text}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-mono text-xs underline underline-offset-2"
        >
          View on explorer ↗
        </a>
      ) : null}
    </div>
  );
}
