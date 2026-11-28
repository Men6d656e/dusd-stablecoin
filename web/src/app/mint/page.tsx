import { MintPanel } from "@/components/MintPanel";
import { activeNetworkConfig } from "@/lib/networks";

export default function MintPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Mint</h1>
        <p className="text-neutral-500">
          Deposit mUSDC collateral and mint dUSD 1:1 on{" "}
          {activeNetworkConfig.label}. If the vault does not already have enough
          allowance, the first transaction approves it; the second mints dUSD.
          Both are simulated before your wallet opens, and the policy is checked
          on-chain before any funds move.
        </p>
      </div>
      <MintPanel />
      <div className="rounded-md border border-neutral-200 p-4 text-xs text-neutral-600 dark:border-neutral-800">
        <p className="font-medium text-neutral-800 dark:text-neutral-200">
          What happens on-chain
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            <code className="font-mono">mUSDC.approve(vault, amount)</code> —
            the vault, not the controller, is the spender.
          </li>
          <li>
            <code className="font-mono">controller.mint(collateralAmount)</code>{" "}
            — compliance check, vault deposit, then{" "}
            <code className="font-mono">dUSD.mint</code> at the fixed 1e12
            scale.
          </li>
          <li>
            Collateral is held by the vault and credited to your account, so the
            backing ratio is unchanged by a mint.
          </li>
        </ol>
      </div>
    </section>
  );
}
