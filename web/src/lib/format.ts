import { formatUnits } from "viem";

export const COLLATERAL_DECIMALS = 6;
export const DUSD_DECIMALS = 18;

const BPS = BigInt(10_000);

function fixed(value: bigint, decimals: number, digits: number): string {
  const asString = formatUnits(value, decimals);
  const [whole, fraction = ""] = asString.split(".");
  const padded = fraction.padEnd(digits, "0").slice(0, digits);
  return digits === 0 ? whole : `${whole}.${padded}`;
}

export function formatCollateral(value: bigint, digits = 2): string {
  return fixed(value, COLLATERAL_DECIMALS, digits);
}

export function formatDusd(value: bigint, digits = 2): string {
  return fixed(value, DUSD_DECIMALS, digits);
}

/**
 * Basis points of backing, e.g. 10000n = 100.00%.
 * Assets are 6-decimal collateral, supply is 18-decimal dUSD, so the assets are
 * scaled to 18 decimals before dividing — mixing the scales reports 0.
 */
export function backingRatioBps(assets: bigint, supply: bigint): bigint {
  if (supply === BigInt(0)) return BigInt(0);
  const scale = BigInt(10) ** BigInt(DUSD_DECIMALS - COLLATERAL_DECIMALS);
  return (assets * scale * BPS) / supply;
}
