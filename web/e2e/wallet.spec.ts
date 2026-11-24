import { expect, test } from "@playwright/test";

test("connect with the mock connector, survive a reload, then disconnect", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Base Sepolia · Testnet only · No real money"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /mock/i }).click();

  // Connected: the chip replaces the connect button.
  await expect(
    page.getByRole("button", { name: "Connect wallet" }),
  ).toHaveCount(0);
  await expect(page.locator("button.font-mono")).toBeVisible();

  // Reload: the cookie rehydrates the connection.
  await page.reload();
  await expect(page.locator("button.font-mono")).toBeVisible();

  // Disconnect from the dropdown.
  await page.locator("button.font-mono").click();
  await page.getByRole("menuitem", { name: "Disconnect" }).click();
  await expect(
    page.getByRole("button", { name: "Connect wallet" }),
  ).toBeVisible();
});
