import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  injected,
  mock,
} from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";
import { activeChain, activeNetwork, rpcUrlFor } from "@/lib/networks";

// The mock connector exists only for Playwright. NEXT_PUBLIC_* is inlined at
// build time, so CI sets it on the build step too.
const isE2E = process.env.NEXT_PUBLIC_E2E === "1";

// Deterministic account so the Playwright spec can assert on it.
const E2E_ACCOUNT = "0xC2e109C0694EA4D120E338E005Da3Ae1d14391D5" as const;

// The active chain must come first: wagmi treats chains[0] as the default, and
// the mock connector connects to it. With a fixed order, an e2e build for
// base-sepolia would connect the wallet to anvil and trip the ChainGuard.
const chains = [
  activeChain,
  ...[anvil, baseSepolia].filter((chain) => chain.id !== activeChain.id),
] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: isE2E
    ? [
        injected(),
        mock({
          accounts: [E2E_ACCOUNT],
          features: { defaultConnected: true, reconnect: true },
        }),
      ]
    : [injected()],
  // A cookie from one network must never rehydrate into another network's
  // session, so the storage key carries the active chain id.
  storage: createStorage({
    storage: cookieStorage,
    key: `dusd-wagmi-${activeChain.id}`,
  }),
  ssr: true,
  transports: {
    [anvil.id]: http(rpcUrlFor("anvil")),
    [baseSepolia.id]: http(rpcUrlFor("base-sepolia")),
  },
});

export { activeNetwork };
