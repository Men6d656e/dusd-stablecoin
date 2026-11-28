import { expect, test } from "@playwright/test";
import {
  type Abi,
  decodeFunctionResult,
  encodeFunctionData,
  type Hex,
  toFunctionSelector,
} from "viem";
import complianceJson from "../src/lib/abi/base-sepolia/CompliancePolicy.json";
import dusdJson from "../src/lib/abi/base-sepolia/dUSD.json";
import controllerJson from "../src/lib/abi/base-sepolia/MintRedeemController.json";
import mockUsdcJson from "../src/lib/abi/base-sepolia/MockUSDC.json";
import vaultJson from "../src/lib/abi/base-sepolia/ReserveVault.json";
import deployment from "../src/lib/deployments/base-sepolia/deployment.json";
import { installInjectedProvider } from "./injected-provider";

const complianceAbi = complianceJson as Abi;
const controllerAbi = controllerJson as Abi;
const dusdAbi = dusdJson as Abi;
const mockUsdcAbi = mockUsdcJson as Abi;
const vaultAbi = vaultJson as Abi;

const FORK_RPC = process.env.FORK_RPC ?? "http://127.0.0.1:8545";

// The deployed allowlisted account, impersonated on the fork. No key is used.
const ACCOUNT = deployment.deployer;
const MUSDC = deployment.contracts.MockUSDC;
const DUSD = deployment.contracts.dUSD;
const VAULT = deployment.contracts.ReserveVault;
const POLICY = deployment.contracts.CompliancePolicy;
const CONTROLLER = deployment.contracts.MintRedeemController;

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

async function call(to: string, data: Hex): Promise<Hex> {
  return (await rpc("eth_call", [{ to, data }, "latest"])) as Hex;
}

/** Raw error body, so a test can assert the custom-error selector. */
async function callError(
  from: string,
  to: string,
  data: Hex,
): Promise<{ message?: string; data?: Hex } | null> {
  const response = await fetch(FORK_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ from, to, data }, "latest"],
    }),
  });
  const body = await response.json();
  return body.error ?? null;
}

async function send(from: string, to: string, data: Hex): Promise<Hex> {
  return (await rpc("eth_sendTransaction", [{ from, to, data }])) as Hex;
}

async function readBalance(token: string, abi: Abi, owner: string) {
  const data = encodeFunctionData({
    abi,
    functionName: "balanceOf",
    args: [owner],
  });
  return decodeFunctionResult({
    abi,
    functionName: "balanceOf",
    data: await call(token, data),
  }) as bigint;
}

async function readTotalDeposits(): Promise<bigint> {
  const data = encodeFunctionData({
    abi: vaultAbi,
    functionName: "totalDeposits",
  });
  return decodeFunctionResult({
    abi: vaultAbi,
    functionName: "totalDeposits",
    data: await call(VAULT, data),
  }) as bigint;
}

async function readAllowance(owner: string, spender: string): Promise<bigint> {
  const data = encodeFunctionData({
    abi: mockUsdcAbi,
    functionName: "allowance",
    args: [owner, spender],
  });
  return decodeFunctionResult({
    abi: mockUsdcAbi,
    functionName: "allowance",
    data: await call(MUSDC, data),
  }) as bigint;
}

let snapshotId = "";

test.beforeAll(async () => {
  await rpc("anvil_impersonateAccount", [ACCOUNT]);
  await rpc("anvil_setBalance", [ACCOUNT, "0x56BC75E2D63100000"]);

  // MockUSDC's owner is the faucet contract. Impersonating it lets the test
  // fund the account deterministically, without spending the real faucet's
  // one-per-24h claim or its lifetime cap.
  const ownerData = encodeFunctionData({
    abi: mockUsdcAbi,
    functionName: "owner",
  });
  const owner = decodeFunctionResult({
    abi: mockUsdcAbi,
    functionName: "owner",
    data: await call(MUSDC, ownerData),
  }) as string;

  await rpc("anvil_impersonateAccount", [owner]);
  await rpc("anvil_setBalance", [owner, "0x56BC75E2D63100000"]);
  await send(
    owner,
    MUSDC,
    encodeFunctionData({
      abi: mockUsdcAbi,
      functionName: "mint",
      args: [ACCOUNT, BigInt(250_000_000)],
    }),
  );

  // The test asserts the two-step flow, so start from a clean allowance even if
  // the live account has approved the vault at some point.
  if ((await readAllowance(ACCOUNT, VAULT)) > BigInt(0)) {
    await send(
      ACCOUNT,
      MUSDC,
      encodeFunctionData({
        abi: mockUsdcAbi,
        functionName: "approve",
        args: [VAULT, BigInt(0)],
      }),
    );
  }

  snapshotId = (await rpc("evm_snapshot", [])) as string;
});

// Each attempt gets the pre-test state back, so a CI retry starts from the same
// allowance and balances instead of inheriting the previous run's transactions.
test.afterEach(async () => {
  await rpc("evm_revert", [snapshotId]);
  snapshotId = (await rpc("evm_snapshot", [])) as string;
});

test("approve the vault, then mint 100 dUSD from the UI", async ({ page }) => {
  const musdcBefore = await readBalance(MUSDC, mockUsdcAbi, ACCOUNT);
  const dusdBefore = await readBalance(DUSD, dusdAbi, ACCOUNT);
  const depositsBefore = await readTotalDeposits();
  expect(await readAllowance(ACCOUNT, VAULT)).toBe(BigInt(0));

  await page.addInitScript(installInjectedProvider, {
    rpcUrl: FORK_RPC,
    account: ACCOUNT,
  });

  await page.goto("/mint");

  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /Fork Wallet/i }).click();

  const action = page.getByTestId("mint-action");
  await page.getByTestId("mint-amount").fill("100");

  await expect(action).toHaveText(/^Approve 100 mUSDC$/);
  await expect(action).toBeEnabled({ timeout: 45_000 });
  await action.click();

  // Step 2 only becomes available after the approval is mined and the
  // allowance read is refreshed.
  await expect(action).toHaveText(/^Mint 100 dUSD$/, {
    timeout: 60_000,
  });
  await expect(action).toBeEnabled();
  await action.click();

  await expect(page.locator('[data-tx-state="confirmed"]')).toHaveCount(2, {
    timeout: 60_000,
  });
  await expect(
    page.getByText("Minted 100 dUSD. Collateral is now in the vault."),
  ).toBeVisible();
  await expect(page.getByText("View on explorer")).toHaveCount(2);

  // The UI's numbers must match the chain: two mUSDC leave the wallet, 100
  // dUSD arrive, and the vault credits exactly the same collateral.
  expect(await readBalance(MUSDC, mockUsdcAbi, ACCOUNT)).toBe(
    musdcBefore - BigInt(100_000_000),
  );
  expect(await readBalance(DUSD, dusdAbi, ACCOUNT)).toBe(
    dusdBefore + BigInt("100000000000000000000"),
  );
  expect(await readTotalDeposits()).toBe(depositsBefore + BigInt(100_000_000));

  // Allowance is consumed by the vault's transferFrom.
  expect(await readAllowance(ACCOUNT, VAULT)).toBe(BigInt(0));
});

test("a blocked address sees the policy message, not a generic revert", async ({
  page,
}) => {
  // The deployer is the policy admin on this deployment, so it can block itself
  // for the duration of the snapshot.
  await send(
    ACCOUNT,
    POLICY,
    encodeFunctionData({
      abi: complianceAbi,
      functionName: "setBlocked",
      args: [ACCOUNT, true],
    }),
  );

  // The UI pre-check is advisory. The controller is the security boundary, so
  // the same mint must revert with its own NotCompliant(address) error.
  const revert = await callError(
    ACCOUNT,
    CONTROLLER,
    encodeFunctionData({
      abi: controllerAbi,
      functionName: "mint",
      args: [BigInt(100_000_000)],
    }),
  );
  expect(revert?.message).toMatch(/revert/i);
  expect(revert?.data).toMatch(
    new RegExp(`^${toFunctionSelector("NotCompliant(address)")}`, "i"),
  );

  await page.addInitScript(installInjectedProvider, {
    rpcUrl: FORK_RPC,
    account: ACCOUNT,
  });

  await page.goto("/mint");
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await page.getByRole("button", { name: /Fork Wallet/i }).click();

  await page.getByTestId("mint-amount").fill("100");

  await expect(page.getByTestId("mint-policy-error")).toContainText(
    /not allowed by the compliance policy/,
    { timeout: 45_000 },
  );
  await expect(page.getByTestId("mint-action")).toBeDisabled();
  await expect(page.getByText(/execution reverted/i)).toHaveCount(0);
});
