import { expect, test } from "@playwright/test";

// Read-only assertion: the mock connector cannot sign a real approve/mint, so
// the write path is covered by e2e-fork/mint.spec.ts on a Base Sepolia fork.
test("the mint route explains the two-step flow", async ({ page }) => {
  await page.goto("/mint");

  await expect(page.getByRole("heading", { name: "Mint" })).toBeVisible();
  await expect(page.getByText(/first transaction approves it/i)).toBeVisible();
  await expect(page.getByText(/What happens on-chain/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Mint" })).toBeVisible();
});
