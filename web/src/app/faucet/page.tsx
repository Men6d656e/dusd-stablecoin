import { FaucetPanel } from "@/components/FaucetPanel";
import { activeNetworkConfig } from "@/lib/networks";

export default function FaucetPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Faucet</h1>
        <p className="text-neutral-500">
          Claim free test mUSDC on {activeNetworkConfig.label}. The faucet
          checks compliance first, then the 24 h cooldown, then the lifetime cap
          — the same rules the contract enforces on-chain.
        </p>
      </div>
      <FaucetPanel />
    </section>
  );
}
