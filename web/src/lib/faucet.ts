import { BaseError, ContractFunctionRevertedError } from "viem";

export const BASESCAN_BASE_URL = "https://sepolia.basescan.org";

export type FaucetErrorName =
  | "NotCompliant"
  | "CooldownActive"
  | "CapExceeded"
  | "UserRejected"
  | "Unknown";

/**
 * Seconds left before `account` may claim again, derived from the contract's
 * `nextClaimAt` read. Zero means "no cooldown running".
 */
export function countdownSeconds(
  nextClaimAt: bigint | undefined,
  nowSeconds: number,
): number {
  if (nextClaimAt === undefined) return 0;
  return Math.max(Number(nextClaimAt) - nowSeconds, 0);
}

/** 86400 → "24:00:00". Always two digits per field. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function asErrorName(value: string | undefined): FaucetErrorName {
  switch (value) {
    case "NotCompliant":
    case "CooldownActive":
    case "CapExceeded":
      return value;
    default:
      return "Unknown";
  }
}

/**
 * The contract's custom errors are the only failure modes the UI maps
 * (TokenFaucet.sol:66-72). Anything else is reported as "Unknown" but still
 * surfaced with its original message.
 */
export function faucetErrorName(error: unknown): FaucetErrorName {
  if (error instanceof BaseError) {
    const reverted = error.walk(
      (candidate) => candidate instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      const named = asErrorName(reverted.data?.errorName);
      if (named !== "Unknown") return named;
    }
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { name?: string; message?: string };
    if (candidate.name === "UserRejectedRequestError") return "UserRejected";
    const match = candidate.message?.match(
      /\b(NotCompliant|CooldownActive|CapExceeded)\b/,
    );
    if (match) return asErrorName(match[1]);
  }

  return "Unknown";
}

export function faucetErrorMessage(error: unknown): string {
  switch (faucetErrorName(error)) {
    case "NotCompliant":
      return "This address is not on the compliance allowlist, so the faucet cannot fund it.";
    case "CooldownActive":
      return "Cooldown is still running — one claim per 24 hours per address.";
    case "CapExceeded":
      return "This address has already claimed the lifetime cap of 500 mUSDC.";
    case "UserRejected":
      return "You rejected the transaction in your wallet.";
    default:
      return error instanceof Error ? error.message : "The claim failed.";
  }
}

export function basescanTxUrl(hash: `0x${string}`): string {
  return `${BASESCAN_BASE_URL}/tx/${hash}`;
}
