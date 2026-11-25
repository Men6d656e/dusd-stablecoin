import { expect, test } from "@playwright/test";

// Read-only assertion: the mock connector cannot sign a real claim, so the
// write path is covered by e2e-fork/faucet.spec.ts against an Anvil fork.
test("the faucet route explains the on-chain rules", async ({ page }) => {
  await page.goto("/faucet");

  await expect(page.getByRole("heading", { name: "Faucet" })).toBeVisible();
  await expect(
    page.getByText(/checks compliance first, then the 24 h cooldown/),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Faucet" })).toBeVisible();
});
