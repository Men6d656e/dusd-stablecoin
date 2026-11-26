import { expect, test } from "@playwright/test";
import deployment from "../src/lib/deployments/base-sepolia/deployment.json";
import { installInjectedProvider } from "./injected-provider";

const FORK_RPC = process.env.FORK_RPC ?? "http://127.0.0.1:8545";
const ACCOUNT = deployment.deployer;

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

/**
 * W4.1 regression: block updates must refresh values without unmounting the
 * grid. The loop re-asserts visibility while it waits for the block number to
 * advance, so a single "loading" replacement fails the test.
 */
test("dashboard keeps the grid mounted while blocks advance", async ({
  page,
}) => {
  await page.addInitScript(installInjectedProvider, {
    rpcUrl: FORK_RPC,
    account: ACCOUNT,
  });

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /Fork Wallet/i }).click();

  const grid = page.getByTestId("dashboard-grid");
  const block = page.getByTestId("dashboard-block");

  await expect(grid).toBeVisible({ timeout: 45_000 });
  const before = await block.textContent();

  await rpc("anvil_mine", ["0x5"]);

  let advanced = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await expect(grid).toBeVisible();
    if ((await block.textContent()) !== before) {
      advanced = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(advanced).toBe(true);
  await expect(grid).toBeVisible();
});
