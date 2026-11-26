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
