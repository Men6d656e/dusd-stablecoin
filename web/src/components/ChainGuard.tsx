"use client";

import { toast } from "sonner";
import { useConnection, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";

export function ChainGuard() {
  const { chainId, isConnected } = useConnection();
  const { mutate: switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === baseSepolia.id) return null;

  return (
    <div className="w-full border-b border-red-300 bg-red-100 px-4 py-2 text-center text-sm text-red-900">
      Wrong network. dUSD lives on Base Sepolia (chain {baseSepolia.id}).
      <Button
        size="sm"
        variant="outline"
        className="ml-3"
        disabled={isPending}
        onClick={() =>
          switchChain(
            { chainId: baseSepolia.id },
            { onError: (err) => toast.error(err.message) },
          )
        }
      >
        {isPending ? "Switching…" : "Switch to Base Sepolia"}
      </Button>
    </div>
  );
}
