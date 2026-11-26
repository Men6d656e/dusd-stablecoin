import Link from "next/link";
import { AccountChip } from "@/components/AccountChip";
import { ChainGuard } from "@/components/ChainGuard";
import { ConnectButton } from "@/components/ConnectButton";
import { activeNetwork, activeNetworkConfig, tierLabel } from "@/lib/networks";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <ChainGuard />
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            dUSD
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Dashboard
          </Link>
          <Link
            href="/faucet"
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Faucet
          </Link>
          <span className="text-sm text-neutral-500">
            {activeNetworkConfig.label} · {tierLabel(activeNetwork)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConnectButton />
          <AccountChip />
        </div>
      </nav>
    </header>
  );
}
