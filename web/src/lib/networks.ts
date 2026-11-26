import { anvil, baseSepolia } from "wagmi/chains";
import { NETWORKS, type NetworkSlug } from "./networks.generated";

export type { NetworkSlug };
export { NETWORKS };

/**
 * The one place the app reads the network environment.
 *
 * `NEXT_PUBLIC_NETWORK` selects a network slug. Everything else — chain id,
 * label, RPC, explorer, addresses — is derived from that selection. No
 * component reads `process.env` and no component branches on a network name.
 */
const CHAINS = {
  anvil,
  "base-sepolia": baseSepolia,
} as const;

export function getActiveNetwork(): NetworkSlug {
  const raw = process.env.NEXT_PUBLIC_NETWORK ?? "anvil";
  if (Object.hasOwn(NETWORKS, raw)) return raw as NetworkSlug;
  throw new Error(
    `Unknown NEXT_PUBLIC_NETWORK "${raw}". Use one of: ${Object.keys(NETWORKS).join(", ")}`,
  );
}

export const activeNetwork = getActiveNetwork();
export const activeNetworkConfig = NETWORKS[activeNetwork];
export const activeChainId: number = activeNetworkConfig.chainId;
export const activeChain = CHAINS[activeNetwork];

/**
 * NEXT_PUBLIC_RPC_URL is an override for the *active* network only. Pointing
 * every transport at one URL would silently break the other chain, and the
 * health check exists to catch exactly that mistake.
 */
export function rpcUrlFor(network: NetworkSlug): string {
  const override = process.env.NEXT_PUBLIC_RPC_URL?.trim();
  if (override && network === activeNetwork) return override;
  return NETWORKS[network].defaultRpcUrl;
}

export function explorerTxUrl(
  network: NetworkSlug,
  hash: string,
): string | null {
  const base = NETWORKS[network].explorerTxUrl;
  return base ? `${base}${hash}` : null;
}

export function tierLabel(network: NetworkSlug): string {
  return NETWORKS[network].tier === "local" ? "local" : "testnet";
}

export function safetyLabel(network: NetworkSlug): string {
  return NETWORKS[network].tier === "local" ? "Local chain" : "Testnet only";
}
