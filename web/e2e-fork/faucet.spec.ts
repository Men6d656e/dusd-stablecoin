import { expect, test } from "@playwright/test";
import deployment from "../src/lib/deployments/84532.json";
import { installInjectedProvider } from "./injected-provider";

const FORK_RPC = process.env.FORK_RPC ?? "http://127.0.0.1:8545";

// The deployed allowlisted account, impersonated on the fork. No key is used:
// Anvil signs for the impersonated address, and the fork never touches the real
// chain, so the real claim and the real 24 h cooldown are left untouched.
const ACCOUNT = deployment.deployer;
const MUSDC = deployment.contracts.MockUSDC;

async function rpc(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(FORK_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}

async function musdcBalance(): Promise<bigint> {
  const data = `0x70a08231${ACCOUNT.slice(2).padStart(64, "0")}`;
  const result = (await rpc("eth_call", [
    { to: MUSDC, data },
    "latest",
  ])) as string;
  return BigInt(result);
}

let snapshotId = "";

test.beforeAll(async () => {
  await rpc("anvil_impersonateAccount", [ACCOUNT]);
  await rpc("anvil_setBalance", [ACCOUNT, "0x56BC75E2D63100000"]);
  snapshotId = (await rpc("evm_snapshot", [])) as string;
});

// Each attempt gets the pre-claim state back, so a CI retry does not run into
// the cooldown the previous attempt just started.
test.afterEach(async () => {
  await rpc("evm_revert", [snapshotId]);
  snapshotId = (await rpc("evm_snapshot", [])) as string;
});

test("claim 100 mUSDC from the UI, then show the on-chain cooldown after reload", async ({
  page,
}) => {
  const balanceBefore = await musdcBalance();

  await page.addInitScript(installInjectedProvider, {
    rpcUrl: FORK_RPC,
    account: ACCOUNT,
  });

  await page.goto("/faucet");

  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /Fork Wallet/i }).click();

  const claimButton = page.getByRole("button", { name: /^Claim .* mUSDC$/ });
  await expect(claimButton).toBeEnabled({ timeout: 45_000 });
  await claimButton.click();

  const confirmed = page.locator('[data-tx-state="confirmed"]');
  await expect(confirmed).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("View on Basescan")).toBeVisible();

  expect(await musdcBalance()).toBe(balanceBefore + BigInt(100_000_000));

  // The next claim is blocked until the contract's nextClaimAt, and the
  // countdown is derived from that read — so it survives a reload.
  await page.reload();
  const cooldownButton = page.getByRole("button", { name: /Next claim in/ });
  await expect(cooldownButton).toBeDisabled({ timeout: 45_000 });
  await expect(page.getByText("100.00 / 500")).toBeVisible();
});
