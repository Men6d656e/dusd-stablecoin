import {
  activeChainId,
  activeNetwork,
  activeNetworkConfig,
  safetyLabel,
} from "@/lib/networks";

export function TestnetBanner() {
  return (
    <div
      data-testid="network-banner"
      className="w-full border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
    >
      {activeNetworkConfig.label} · {activeChainId} ·{" "}
      {safetyLabel(activeNetwork)} · No real money
    </div>
  );
}
