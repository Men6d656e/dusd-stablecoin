import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/dashboard",
  "/faucet",
  "/mint",
  "/redeem",
  "/send",
  "/reserves",
  "/compliance",
  "/transparency",
];

test("every route renders the testnet banner", async ({ page }) => {
  // First dev-server visit compiles each route; give the loop room locally.
  test.setTimeout(120_000);
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByTestId("network-banner")).toContainText(
      /No real money/,
    );
  }
});
