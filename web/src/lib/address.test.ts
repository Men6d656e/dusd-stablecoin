import { describe, expect, it } from "vitest";
import { truncateAddress } from "./address";

const deployer = "0xC2e109C0694EA4D120E338E005Da3Ae1d14391D5";

describe("truncateAddress", () => {
  it("keeps 4 characters on each side", () => {
    expect(truncateAddress(deployer)).toBe("0xC2e1…91D5");
  });

  it("lets the caller choose the size", () => {
    expect(truncateAddress(deployer, 2)).toBe("0xC2…D5");
  });

  it("leaves a non-address untouched", () => {
    expect(truncateAddress("not-an-address")).toBe("not-an-address");
    expect(truncateAddress("0x1234")).toBe("0x1234");
    expect(truncateAddress("")).toBe("");
  });
});
