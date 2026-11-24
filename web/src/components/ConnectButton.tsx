"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConnect, useConnection, useConnectors } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ConnectButton() {
  const [open, setOpen] = useState(false);
  const { isConnected } = useConnection();
  const connectors = useConnectors();
  const { mutate: connect, isPending, error } = useConnect();

  if (isConnected) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Connect wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
          <DialogDescription>
            Desktop extension wallets only. Base Sepolia, testnet funds.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {connectors.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No wallet detected. Install MetaMask, Rabby, or Rainbow.
            </p>
          ) : (
            connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  connect(
                    { connector },
                    {
                      onSuccess: () => setOpen(false),
                      onError: (err) => toast.error(err.message),
                    },
                  )
                }
              >
                {connector.name}
              </Button>
            ))
          )}
          {error ? (
            <p className="text-sm text-red-600">{error.message}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
