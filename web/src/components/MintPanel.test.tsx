import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The mint panel has one job: decide which of two transactions is next, and
 * never let an invalid or unaffordable amount reach a wallet. The hooks are
 * mocked so every branch is reachable without a chain; the write/receipt mocks
 * are stateful so the approve → mint transition can be walked end to end.
 */
const APPROVE_HASH = `0x${"a".repeat(64)}`;
const MINT_HASH = `0x${"b".repeat(64)}`;

const state = vi.hoisted(() => ({
  isConnected: true,
  chainId: 84532,
  balance: BigInt(1_000_000_000),
  allowance: BigInt(0),
  refetchedAllowance: BigInt(0),
  allowed: true as boolean | undefined,
  allowanceError: undefined as Error | undefined,
  allowedError: undefined as Error | undefined,
  hasApproveRequest: true,
  hasMintRequest: true,
  approveData: undefined as string | undefined,
  approveError: undefined as Error | undefined,
  approveRequest: undefined as unknown,
  approveReceiptSuccess: false,
  approveReceiptError: undefined as Error | undefined,
  mintData: undefined as string | undefined,
  mintError: undefined as Error | undefined,
  mintRequest: undefined as unknown,
  mintReceiptSuccess: false,
  mintReceiptError: undefined as Error | undefined,
}));

vi.mock("wagmi", () => ({
  useConnection: () => ({
    address: "0xC2e109C0694EA4D120E338E005Da3Ae1d14391D5",
    isConnected: state.isConnected,
    chainId: state.chainId,
  }),
  useBlockNumber: () => ({ data: BigInt(100) }),
  useWaitForTransactionReceipt: ({ hash }: { hash?: string }) => {
    const isApprove = hash !== undefined && hash === state.approveData;
    const isMint = hash !== undefined && hash === state.mintData;
    const error = isApprove
      ? state.approveReceiptError
      : isMint
        ? state.mintReceiptError
        : undefined;
    return {
      data: undefined,
      isLoading: false,
      isSuccess:
        (isApprove && state.approveReceiptSuccess) ||
        (isMint && state.mintReceiptSuccess),
      isError: error !== undefined,
      error,
    };
  },
}));

vi.mock("@/lib/networks", () => ({
  activeNetwork: "base-sepolia",
  activeChain: { id: 84532 },
  activeChainId: 84532,
  explorerTxUrl: (_network: string, hash: string) =>
    `https://sepolia.basescan.org/tx/${hash}`,
  activeNetworkConfig: {
    chainId: 84532,
    label: "Base Sepolia",
    tier: "testnet",
    defaultRpcUrl: "https://sepolia.base.org",
    explorerTxUrl: "https://sepolia.basescan.org/tx/",
  },
}));

vi.mock("@/lib/contracts", () => ({
  contracts: {
    MockUSDC: "0xd5687e74B3c26aA25c2a5985E2Ff974A99Fd563C",
    CompliancePolicy: "0x61994d53cadf2cD8786E4ea84Dc497d1ccC755F5",
    ReserveVault: "0x0d065884ce8D542510bF6b99B6Da8055e39f3dF5",
    dUSD: "0x530d583c44E44cc07154741f4D4B4cc9500bfa43",
    MintRedeemController: "0xDc042BA286F204231A7aa7bc1eC1208aB03D65C2",
    TokenFaucet: "0xa10D4D20d9B856f2B8e4152C3e0d1802ADdc06cD",
    FixedPriceSource: "0x4B7C3301b3AeCeE64f8d0622a2fE0813404f3346",
  },
}));

vi.mock("@/generated/contracts", () => {
  const read = (value: () => bigint | boolean | undefined) => () => ({
    data: value(),
    error: undefined,
    isFetching: false,
    refetch: vi.fn(),
  });
  const simulate = (hasRequest: () => boolean) => (config: unknown) => ({
    data: hasRequest() ? { request: config } : undefined,
    error: undefined,
  });

  return {
    useReadCompliancePolicyIsAllowed: () => ({
      data: state.allowed,
      error: state.allowedError,
      isFetching: false,
      refetch: vi.fn(),
    }),
    useReadDUsdBalanceOf: read(() => BigInt("20000000000000000000")),
    useReadDUsdTotalSupply: read(() => BigInt("2000000000000000000000")),
    useReadMintRedeemControllerScale: read(() => BigInt(1_000_000_000_000)),
    useReadMockUsdcAllowance: () => ({
      data: state.allowance,
      error: state.allowanceError,
      isFetching: false,
      refetch: () => {
        state.allowance = state.refetchedAllowance;
        return Promise.resolve();
      },
    }),
    useReadMockUsdcBalanceOf: read(() => state.balance),
    useReadReserveVaultDeposits: read(() => BigInt(0)),
    useReadReserveVaultTotalAssets: read(() => BigInt(2_000_000_000)),
    useSimulateMintRedeemControllerMint: simulate(() => state.hasMintRequest),
    useSimulateMockUsdcApprove: simulate(() => state.hasApproveRequest),
    useWriteMintRedeemControllerMint: () => ({
      data: state.mintData,
      error: state.mintError,
      isPending: false,
      mutate: (request: unknown) => {
        state.mintRequest = request;
        state.mintData = MINT_HASH;
      },
    }),
    useWriteMockUsdcApprove: () => ({
      data: state.approveData,
      error: state.approveError,
      isPending: false,
      mutate: (request: unknown) => {
        state.approveRequest = request;
        state.approveData = APPROVE_HASH;
      },
    }),
  };
});

import { MintPanel } from "./MintPanel";

function actionButton(): HTMLButtonElement {
  return screen.getByTestId("mint-action") as HTMLButtonElement;
}

function typeAmount(value: string) {
  fireEvent.change(screen.getByTestId("mint-amount"), {
    target: { value },
  });
}

beforeEach(() => {
  state.isConnected = true;
  state.chainId = 84532;
  state.balance = BigInt(1_000_000_000);
  state.allowance = BigInt(0);
  state.refetchedAllowance = BigInt(0);
  state.allowed = true;
  state.allowanceError = undefined;
  state.allowedError = undefined;
  state.hasApproveRequest = true;
  state.hasMintRequest = true;
  state.approveData = undefined;
  state.approveError = undefined;
  state.approveRequest = undefined;
  state.approveReceiptSuccess = false;
  state.approveReceiptError = undefined;
  state.mintData = undefined;
  state.mintError = undefined;
  state.mintRequest = undefined;
  state.mintReceiptSuccess = false;
  state.mintReceiptError = undefined;
});

afterEach(cleanup);

describe("MintPanel", () => {
  it("asks for a wallet before showing the form", () => {
    state.isConnected = false;
    render(<MintPanel />);
    expect(screen.getByText(/Connect a wallet to mint dUSD/)).not.toBeNull();
    expect(screen.queryByTestId("mint-action")).toBeNull();
  });

  it("asks for the right chain before showing the form", () => {
    state.chainId = 1;
    render(<MintPanel />);
    expect(screen.getByText(/Switch to Base Sepolia/)).not.toBeNull();
    expect(screen.queryByTestId("mint-action")).toBeNull();
  });

  it("starts with the action disabled until an amount is typed", () => {
    render(<MintPanel />);
    expect(actionButton().textContent).toBe("Enter an amount");
    expect(actionButton().disabled).toBe(true);
  });

  it("offers the approval first when the allowance is short", () => {
    render(<MintPanel />);
    typeAmount("100");

    expect(actionButton().textContent).toBe("Approve 100 mUSDC");
    expect(actionButton().disabled).toBe(false);
    expect(screen.getByText(/Step 1 of 2/)).not.toBeNull();
  });

  it("approves the vault, never the controller", () => {
    render(<MintPanel />);
    typeAmount("100");
    fireEvent.click(actionButton());

    expect(state.approveRequest).toMatchObject({
      address: "0xd5687e74B3c26aA25c2a5985E2Ff974A99Fd563C",
      args: ["0x0d065884ce8D542510bF6b99B6Da8055e39f3dF5", BigInt(100_000_000)],
    });
  });

  it("moves to the mint after the approval confirms and the allowance refetches", () => {
    const { rerender } = render(<MintPanel />);
    typeAmount("100");
    fireEvent.click(actionButton());
    rerender(<MintPanel />);

    state.approveReceiptSuccess = true;
    state.refetchedAllowance = BigInt(100_000_000);
    rerender(<MintPanel />);
    rerender(<MintPanel />);

    expect(state.allowance).toBe(BigInt(100_000_000));
    expect(actionButton().textContent).toBe("Mint 100 dUSD");
    expect(screen.getByText(/Step 2 of 2/)).not.toBeNull();
  });

  it("offers the mint once the vault is approved", () => {
    state.allowance = BigInt(100_000_000);
    render(<MintPanel />);
    typeAmount("100");

    expect(actionButton().textContent).toBe("Mint 100 dUSD");
    expect(actionButton().disabled).toBe(false);
    expect(screen.getByText(/Step 2 of 2/)).not.toBeNull();
  });

  it("mints the parsed collateral amount", () => {
    state.allowance = BigInt(100_000_000);
    render(<MintPanel />);
    typeAmount("100");
    fireEvent.click(actionButton());

    expect(state.mintRequest).toMatchObject({
      address: "0xDc042BA286F204231A7aa7bc1eC1208aB03D65C2",
      args: [BigInt(100_000_000)],
    });
  });

  it("clears the form and reports the minted total after confirmation", () => {
    state.allowance = BigInt(100_000_000);
    const { rerender } = render(<MintPanel />);
    typeAmount("100");
    fireEvent.click(actionButton());
    rerender(<MintPanel />);

    state.mintReceiptSuccess = true;
    rerender(<MintPanel />);

    expect((screen.getByTestId("mint-amount") as HTMLInputElement).value).toBe(
      "",
    );
    expect(screen.getByText(/Minted 100 dUSD/)).not.toBeNull();
  });

  it("surfaces a mined-but-reverted mint instead of staying pending", () => {
    state.allowance = BigInt(100_000_000);
    state.mintReceiptError = new Error("execution reverted: NotCompliant");
    const { rerender } = render(<MintPanel />);
    typeAmount("100");
    fireEvent.click(actionButton());
    rerender(<MintPanel />);

    expect(
      screen.getByText(/not allowed by the compliance policy/),
    ).not.toBeNull();
  });

  it("blocks an amount larger than the balance", () => {
    render(<MintPanel />);
    typeAmount("5000");

    expect(actionButton().textContent).toBe("Amount exceeds balance");
    expect(actionButton().disabled).toBe(true);
    expect(screen.getByText(/You only have 1000.00 mUSDC/)).not.toBeNull();
  });

  it("explains a compliance rejection instead of offering a transaction", () => {
    state.allowed = false;
    render(<MintPanel />);
    typeAmount("100");

    expect(screen.getByTestId("mint-policy-error")).not.toBeNull();
    expect(actionButton().textContent).toBe("Address not allowed");
    expect(actionButton().disabled).toBe(true);
  });

  it("reports a failed allowance read instead of pretending the allowance is zero", () => {
    state.allowanceError = new Error("rpc unavailable");
    render(<MintPanel />);
    typeAmount("100");

    expect(screen.getByTestId("mint-read-error")).not.toBeNull();
    expect(actionButton().disabled).toBe(true);
  });

  it("rejects more than 6 decimals before simulation", () => {
    render(<MintPanel />);
    typeAmount("1.1234567");

    expect(screen.getByText(/at most 6 digits/)).not.toBeNull();
    expect(actionButton().disabled).toBe(true);
  });

  it("fills the full balance with the Max button", () => {
    render(<MintPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Max" }));

    expect((screen.getByTestId("mint-amount") as HTMLInputElement).value).toBe(
      "1000",
    );
  });

  it("stays disabled when the simulation is not ready", () => {
    state.hasApproveRequest = false;
    render(<MintPanel />);
    typeAmount("100");

    expect(actionButton().disabled).toBe(true);
  });
});
