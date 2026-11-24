import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          dUSD
        </Link>
        <span className="text-sm text-neutral-500">Base Sepolia · testnet</span>
      </nav>
    </header>
  );
}
