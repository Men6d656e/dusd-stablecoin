"use client";

import { toast } from "sonner";
import { useConnection, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/address";

export function AccountChip() {
  const { address, connector, isConnected } = useConnection();
  const { mutate: disconnect } = useDisconnect();

  if (!isConnected || !address) return null;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address ?? "");
      toast.success("Address copied");
    } catch {
      toast.error("Clipboard unavailable — copy from the menu instead");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono">
          {truncateAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-xs text-neutral-500">
            {connector?.name ?? "Wallet"}
          </span>
          <span className="block truncate font-mono text-xs">{address}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>Copy address</DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
