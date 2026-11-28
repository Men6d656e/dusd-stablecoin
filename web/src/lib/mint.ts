import {
  BaseError,
  ContractFunctionRevertedError,
  formatUnits,
  parseUnits,
} from "viem";
import { backingRatioBps, COLLATERAL_DECIMALS, DUSD_DECIMALS } from "./format";

/**
 * The controller's fixed collateral→dUSD factor: 1e18 / 1e6 = 1e12.
 * The UI reads `SCALE` from the controller and only falls back to this value
 * while that read is in flight.
 */
export const DEFAULT_CONTROLLER_SCALE =
  BigInt(10) ** BigInt(DUSD_DECIMALS - COLLATERAL_DECIMALS);

export type AmountIssue = "empty" | "invalid" | "too-many-decimals" | "zero";

export type ParsedAmount =
  | { ok: true; value: bigint }
  | { ok: false; issue: AmountIssue };

/**
 * Parse a user-typed mUSDC amount without ever rounding silently.
 *
 * `parseUnits` would accept "1.1234567" and round it to the nearest 6-decimal
 * value, which could send a different amount than the user typed. This rejects
 * the input instead, and normalises the two forms humans actually type: ".5"
 * and "5.".
 */
export function parseCollateralInput(
  raw: string,
  decimals = COLLATERAL_DECIMALS,
): ParsedAmount {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, issue: "empty" };
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === ".") {
    return { ok: false, issue: "invalid" };
  }

  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) {
    return { ok: false, issue: "too-many-decimals" };
  }

  const normalised = trimmed.startsWith(".")
    ? `0${trimmed}`
    : trimmed.endsWith(".")
      ? whole
      : trimmed;
  const value = parseUnits(normalised, decimals);
  if (value <= BigInt(0)) return { ok: false, issue: "zero" };

  return { ok: true, value };
}

/** Human-readable reason, or null while the field is still empty. */
export function amountIssueMessage(issue: AmountIssue): string | null {
  switch (issue) {
    case "empty":
      return null;
    case "invalid":
      return "Enter a number, for example 100.";
    case "too-many-decimals":
      return "mUSDC has 6 decimals — use at most 6 digits after the point.";
    case "zero":
      return "Enter an amount greater than zero.";
  }
}

function trimFraction(text: string): string {
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

/** 100_000_000n → "100", 100_500_000n → "100.5". Used by the Max button. */
export function formatCollateralInput(value: bigint): string {
  return trimFraction(formatUnits(value, COLLATERAL_DECIMALS));
}

/** Same exact, unrounded formatting for the dUSD amount shown in the action. */
export function formatDusdInput(value: bigint): string {
  return trimFraction(formatUnits(value, DUSD_DECIMALS));
}

/** The vault pulls collateral with transferFrom, so the spender is the vault. */
export function needsApproval(allowance: bigint, amount: bigint): boolean {
  return amount > BigInt(0) && allowance < amount;
}

/** 1 mUSDC (1e6) mints 1 dUSD (1e18) at the default scale. */
export function dusdForCollateral(
  collateral: bigint,
  scale = DEFAULT_CONTROLLER_SCALE,
): bigint {
  return collateral * scale;
}

/**
 * Backing ratio after a mint, in basis points. Both sides grow by the same
 * economic amount, so a healthy vault stays at 100.00% — showing the projected
 * number makes that invariant visible instead of asking the user to trust it.
 */
export function previewBackingRatioBps(
  assets: bigint,
  supply: bigint,
  mintCollateral: bigint,
  scale = DEFAULT_CONTROLLER_SCALE,
): bigint {
  return backingRatioBps(
    assets + mintCollateral,
    supply + mintCollateral * scale,
  );
}

export type MintErrorName =
  | "NotCompliant"
  | "ZeroAmount"
  | "InsufficientAllowance"
  | "InsufficientBalance"
  | "UserRejected"
  | "Unknown";

function asMintErrorName(value: string | undefined): MintErrorName | null {
  switch (value) {
    case "NotCompliant":
      return "NotCompliant";
    case "ZeroAmount":
      return "ZeroAmount";
    case "ERC20InsufficientAllowance":
    case "InsufficientAllowance":
      return "InsufficientAllowance";
    case "ERC20InsufficientBalance":
    case "InsufficientBalance":
      return "InsufficientBalance";
    default:
      return null;
  }
}

/**
 * Map the controller's and ERC-20's custom errors to one of the failure modes
 * the UI explains. Anything else keeps its original message.
 */
export function mintErrorName(error: unknown): MintErrorName {
  if (error instanceof BaseError) {
    const reverted = error.walk(
      (candidate) => candidate instanceof ContractFunctionRevertedError,
    );
    if (reverted instanceof ContractFunctionRevertedError) {
      const named = asMintErrorName(reverted.data?.errorName);
      if (named) return named;
    }
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { name?: string; message?: string };
    if (candidate.name === "UserRejectedRequestError") return "UserRejected";

    const match = candidate.message?.match(
      /\b(NotCompliant|ZeroAmount|ERC20InsufficientAllowance|ERC20InsufficientBalance)\b/,
    );
    if (match) return asMintErrorName(match[1]) ?? "Unknown";
  }

  return "Unknown";
}

export function mintErrorMessage(error: unknown): string {
  switch (mintErrorName(error)) {
    case "NotCompliant":
      return "This address is not allowed by the compliance policy, so it cannot mint dUSD.";
    case "ZeroAmount":
      return "Enter an amount greater than zero.";
    case "InsufficientAllowance":
      return "Approve mUSDC for the vault before minting.";
    case "InsufficientBalance":
      return "You do not have enough mUSDC for this mint.";
    case "UserRejected":
      return "You rejected the transaction in your wallet.";
    default:
      return error instanceof Error ? error.message : "The mint failed.";
  }
}
