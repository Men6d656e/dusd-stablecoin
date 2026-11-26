"use client";

import { toast } from "sonner";
import { useConnection, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { activeChain, activeNetworkConfig } from "@/lib/networks";

export function ChainGuard() {
  const { chainId, isConnected } = useConnection();
  const { mutate: switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === activeChain.id) return null;

  return (
    <div className="w-full border-b border-red-300 bg-red-100 px-4 py-2 text-center text-sm text-red-900">
      Wrong network. dUSD lives on {activeNetworkConfig.label} (chain{" "}
      {activeChain.id}).
      <Button
        size="sm"
        variant="outline"
        className="ml-3"
        disabled={isPending}
        onClick={() =>
          switchChain(
            { chainId: activeChain.id },
            { onError: (err) => toast.error(err.message) },
          )
        }
      >
        {isPending ? "Switching…" : `Switch to ${activeNetworkConfig.label}`}
      </Button>
    </div>
  );
}
