import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const FORK_RPC = process.env.FORK_RPC ?? "https://sepolia.base.org";
const FORK_NODE = "http://127.0.0.1:8545";

/**
 * Runs the app against a local Anvil fork, so the faucet claim is a real
 * transaction with real receipts — without spending Base Sepolia funds or
 * burning any address's cooldown.
 *
 * The build must bake the fork RPC in:
 *   NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545 pnpm build
 */
export default defineConfig({
  testDir: "./e2e-fork",
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  timeout: 120_000,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: [
    {
      command: `anvil --fork-url ${FORK_RPC} --chain-id 84532 --port 8545 --silent`,
      url: FORK_NODE,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "pnpm start",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_PUBLIC_RPC_URL: FORK_NODE },
    },
  ],
});
