import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: isCI ? 1 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: isCI ? "pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_E2E: "1" },
  },
});
