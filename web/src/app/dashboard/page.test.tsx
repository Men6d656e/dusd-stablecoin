import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The regression this file protects: a block-number change must never replace
 * the dashboard grid with the loading fallback. The hooks are mocked so the
 * test can move from "first load" to "refetch" deterministically, without a
 * chain, RPC, or wallet.
 */
const state = vi.hoisted(() => ({
  blockNumber: BigInt(100),
  hasData: true,
  isFetching: false,
}));

vi.mock("wagmi", () => ({
  useConnection: () => ({
    address: "0xC2e109C0694EA4D120E338E005Da3Ae1d14391D5",
    isConnected: true,
    chainId: 84532,
  }),
  useBlockNumber: () => ({ data: state.blockNumber }),
}));

vi.mock("@/lib/networks", () => ({
  activeNetwork: "base-sepolia",
  activeChain: { id: 84532 },
  activeChainId: 84532,
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
  const read = (value: bigint) => () => ({
    data: state.hasData ? value : undefined,
    error: undefined,
    isLoading: !state.hasData,
    isFetching: state.isFetching || !state.hasData,
  });

  return {
    useReadMockUsdcBalanceOf: read(BigInt(1_000_000)),
    useReadDUsdBalanceOf: read(BigInt(2_000_000_000_000_000_000)),
    useReadDUsdTotalSupply: read(BigInt(2_000_000_000_000_000_000)),
    useReadReserveVaultTotalAssets: read(BigInt(2_000_000)),
    useReadReserveVaultTotalDeposits: read(BigInt(2_000_000)),
    useReadReserveVaultSurplus: read(BigInt(0)),
  };
});

import DashboardPage from "./page";

beforeEach(() => {
  state.blockNumber = BigInt(100);
  state.hasData = true;
  state.isFetching = false;
});

afterEach(cleanup);

describe("DashboardPage", () => {
  it("shows the loading fallback only before the first successful read", () => {
    state.hasData = false;
    state.isFetching = true;

    const { rerender } = render(<DashboardPage />);

    expect(screen.queryByTestId("dashboard-grid")).toBeNull();
    expect(screen.getByText("Reading chain…")).not.toBeNull();

    state.hasData = true;
    state.isFetching = false;
    rerender(<DashboardPage />);

    expect(screen.getByTestId("dashboard-grid")).not.toBeNull();
    expect(screen.queryByText("Reading chain…")).toBeNull();
    expect(screen.getByText("Backing ratio")).not.toBeNull();
  });

  it("keeps the grid mounted across a block-number change and shows an updating hint", () => {
    const { rerender } = render(<DashboardPage />);

    expect(screen.getByTestId("dashboard-grid")).not.toBeNull();
    expect(screen.getByTestId("dashboard-block").textContent).toBe("100");

    state.blockNumber = BigInt(101);
    state.isFetching = true;
    rerender(<DashboardPage />);

    expect(screen.getByTestId("dashboard-grid")).not.toBeNull();
    expect(screen.queryByText("Reading chain…")).toBeNull();
    expect(screen.getByTestId("dashboard-updating")).not.toBeNull();
    expect(screen.getByTestId("dashboard-block").textContent).toBe("101");
    expect(screen.getByText("dUSD total supply")).not.toBeNull();

    state.blockNumber = BigInt(102);
    state.isFetching = false;
    rerender(<DashboardPage />);

    expect(screen.getByTestId("dashboard-grid")).not.toBeNull();
    expect(screen.queryByTestId("dashboard-updating")).toBeNull();
    expect(screen.getByTestId("dashboard-block").textContent).toBe("102");
  });
});
