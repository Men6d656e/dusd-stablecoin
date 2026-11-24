import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/dashboard",
  "/mint",
  "/redeem",
  "/send",
  "/reserves",
  "/compliance",
  "/transparency",
];

test("every route renders the testnet banner", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(
      page.getByText("Base Sepolia · Testnet only · No real money"),
    ).toBeVisible();
  }
});
