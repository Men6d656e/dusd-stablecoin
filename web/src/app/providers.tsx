"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { type State, WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/config";

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider
      config={wagmiConfig}
      initialState={initialState}
      reconnectOnMount={Boolean(initialState)}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
