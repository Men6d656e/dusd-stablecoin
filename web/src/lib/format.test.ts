import { describe, expect, it } from "vitest";
import { backingRatioBps, formatCollateral, formatDusd } from "./format";

const token = (whole: number | string) =>
  BigInt(whole) * BigInt(10) ** BigInt(18);

describe("decimals", () => {
  it("formats 6-decimal collateral", () => {
    expect(formatCollateral(BigInt(1_000_000))).toBe("1.00");
    expect(formatCollateral(BigInt(10_000_000_000))).toBe("10000.00");
    expect(formatCollateral(BigInt(1_234_567))).toBe("1.23");
  });

  it("formats 18-decimal dUSD", () => {
    expect(formatDusd(token(1))).toBe("1.00");
    expect(formatDusd(token(100))).toBe("100.00");
  });

  it("does not confuse the two scales", () => {
    expect(formatDusd(BigInt(1_000_000))).toBe("0.00");
    expect(formatCollateral(BigInt(10) ** BigInt(18))).toBe("1000000000000.00");
  });
});

describe("backingRatioBps", () => {
  it("is 10000 when fully backed", () => {
    expect(backingRatioBps(BigInt(100_000_000), token(100))).toBe(
      BigInt(10_000),
    );
  });

  it("is 5000 when half backed", () => {
    expect(backingRatioBps(BigInt(50_000_000), token(100))).toBe(BigInt(5_000));
  });

  it("is 0 with no supply", () => {
    expect(backingRatioBps(BigInt(5), BigInt(0))).toBe(BigInt(0));
  });
});
