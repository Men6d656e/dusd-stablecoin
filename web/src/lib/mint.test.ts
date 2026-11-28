import { describe, expect, it } from "vitest";
import {
  amountIssueMessage,
  DEFAULT_CONTROLLER_SCALE,
  dusdForCollateral,
  formatCollateralInput,
  formatDusdInput,
  mintErrorMessage,
  mintErrorName,
  needsApproval,
  parseCollateralInput,
  previewBackingRatioBps,
} from "./mint";

describe("parseCollateralInput", () => {
  it("parses whole and fractional 6-decimal amounts", () => {
    expect(parseCollateralInput("100")).toEqual({
      ok: true,
      value: BigInt(100_000_000),
    });
    expect(parseCollateralInput("100.5")).toEqual({
      ok: true,
      value: BigInt(100_500_000),
    });
    expect(parseCollateralInput(" 1 ")).toEqual({
      ok: true,
      value: BigInt(1_000_000),
    });
  });

  it("accepts the shorthand forms people type", () => {
    expect(parseCollateralInput(".5")).toEqual({
      ok: true,
      value: BigInt(500_000),
    });
    expect(parseCollateralInput("5.")).toEqual({
      ok: true,
      value: BigInt(5_000_000),
    });
  });

  it("rejects empty, malformed, over-precise, and zero amounts", () => {
    expect(parseCollateralInput("")).toEqual({ ok: false, issue: "empty" });
    expect(parseCollateralInput("   ")).toEqual({ ok: false, issue: "empty" });
    expect(parseCollateralInput(".")).toEqual({ ok: false, issue: "invalid" });
    expect(parseCollateralInput("1,000")).toEqual({
      ok: false,
      issue: "invalid",
    });
    expect(parseCollateralInput("-1")).toEqual({ ok: false, issue: "invalid" });
    expect(parseCollateralInput("1.1234567")).toEqual({
      ok: false,
      issue: "too-many-decimals",
    });
    expect(parseCollateralInput("0")).toEqual({ ok: false, issue: "zero" });
    expect(parseCollateralInput("0.000000")).toEqual({
      ok: false,
      issue: "zero",
    });
  });
});

describe("amountIssueMessage", () => {
  it("stays quiet while the field is empty", () => {
    expect(amountIssueMessage("empty")).toBeNull();
  });

  it("explains each rejected input", () => {
    expect(amountIssueMessage("invalid")).toMatch(/Enter a number/);
    expect(amountIssueMessage("too-many-decimals")).toMatch(/6 decimals/);
    expect(amountIssueMessage("zero")).toMatch(/greater than zero/);
  });
});

describe("formatCollateralInput", () => {
  it("trims trailing zeros for the Max button", () => {
    expect(formatCollateralInput(BigInt(100_000_000))).toBe("100");
    expect(formatCollateralInput(BigInt(100_500_000))).toBe("100.5");
    expect(formatCollateralInput(BigInt(1))).toBe("0.000001");
    expect(formatCollateralInput(BigInt(1_000_000))).toBe("1");
  });
});

describe("formatDusdInput", () => {
  it("shows the exact amount the button will mint", () => {
    expect(formatDusdInput(BigInt("100000000000000000000"))).toBe("100");
    expect(formatDusdInput(BigInt("100500000000000000000"))).toBe("100.5");
    expect(formatDusdInput(BigInt("9000000000000000"))).toBe("0.009");
  });
});

describe("approval and scaling", () => {
  it("only needs an approval when the allowance is short", () => {
    expect(needsApproval(BigInt(0), BigInt(1))).toBe(true);
    expect(needsApproval(BigInt(99), BigInt(100))).toBe(true);
    expect(needsApproval(BigInt(100), BigInt(100))).toBe(false);
    expect(needsApproval(BigInt(0), BigInt(0))).toBe(false);
  });

  it("mints 18-decimal dUSD at the controller's 1e12 scale", () => {
    expect(DEFAULT_CONTROLLER_SCALE).toBe(BigInt(1_000_000_000_000));
    expect(dusdForCollateral(BigInt(100_000_000))).toBe(
      BigInt("100000000000000000000"),
    );
  });

  it("keeps the backing ratio at 100% after a mint", () => {
    expect(
      previewBackingRatioBps(
        BigInt(100_000_000),
        BigInt("100000000000000000000"),
        BigInt(50_000_000),
      ),
    ).toBe(BigInt(10_000));

    expect(
      previewBackingRatioBps(BigInt(0), BigInt(0), BigInt(100_000_000)),
    ).toBe(BigInt(10_000));
  });
});

describe("mint error mapping", () => {
  it("recognises the controller's custom errors", () => {
    expect(mintErrorName(new Error("execution reverted: NotCompliant"))).toBe(
      "NotCompliant",
    );
    expect(mintErrorName(new Error("reverted with ZeroAmount"))).toBe(
      "ZeroAmount",
    );
  });

  it("recognises the ERC-20 allowance and balance errors", () => {
    expect(
      mintErrorName(new Error("ERC20InsufficientAllowance(0xabc, 0, 100)")),
    ).toBe("InsufficientAllowance");
    expect(
      mintErrorName(new Error("ERC20InsufficientBalance(0xabc, 0, 100)")),
    ).toBe("InsufficientBalance");
  });

  it("recognises a wallet rejection", () => {
    expect(
      mintErrorName({ name: "UserRejectedRequestError", message: "denied" }),
    ).toBe("UserRejected");
  });

  it("falls back to the original message", () => {
    expect(mintErrorName(new Error("boom"))).toBe("Unknown");
    expect(mintErrorMessage(new Error("boom"))).toBe("boom");
    expect(mintErrorMessage("not an error")).toBe("The mint failed.");
  });

  it("explains the failure modes the user can act on", () => {
    expect(mintErrorMessage(new Error("NotCompliant"))).toMatch(
      /compliance policy/,
    );
    expect(mintErrorMessage(new Error("ZeroAmount"))).toMatch(
      /greater than zero/,
    );
    expect(mintErrorMessage(new Error("ERC20InsufficientAllowance"))).toMatch(
      /Approve mUSDC/,
    );
    expect(mintErrorMessage(new Error("ERC20InsufficientBalance"))).toMatch(
      /not have enough mUSDC/,
    );
    expect(mintErrorMessage({ name: "UserRejectedRequestError" })).toMatch(
      /rejected the transaction/,
    );
  });
});
