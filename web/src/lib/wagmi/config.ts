import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
  mock,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.base.org";

// The mock connector exists only for Playwright. NEXT_PUBLIC_* is inlined at
// build time, so CI sets it on the build step too.
const isE2E = process.env.NEXT_PUBLIC_E2E === "1";

// Deterministic account so the Playwright spec can assert on it.
const E2E_ACCOUNT = "0xC2e109C0694EA4D120E338E005Da3Ae1d14391D5" as const;

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: isE2E
    ? [
        injected(),
        mock({
          accounts: [E2E_ACCOUNT],
          features: { defaultConnected: true, reconnect: true },
        }),
      ]
    : [injected()],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
});
