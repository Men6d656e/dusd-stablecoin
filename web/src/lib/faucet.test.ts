import { describe, expect, it } from "vitest";
import {
  countdownSeconds,
  faucetErrorMessage,
  faucetErrorName,
  formatCountdown,
} from "./faucet";

describe("countdownSeconds", () => {
  it("returns the remaining seconds from nextClaimAt", () => {
    expect(countdownSeconds(BigInt(1_700_000_000), 1_699_999_000)).toBe(1000);
  });

  it("returns zero once the cooldown has elapsed", () => {
    expect(countdownSeconds(BigInt(1_700_000_000), 1_700_000_001)).toBe(0);
  });

  it("treats nextClaimAt = 0 (never claimed) as no cooldown", () => {
    expect(countdownSeconds(BigInt(0), 1_700_000_000)).toBe(0);
  });

  it("returns zero while the read is still loading", () => {
    expect(countdownSeconds(undefined, 1_700_000_000)).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("formats the 24 h faucet cooldown", () => {
    expect(formatCountdown(86_400)).toBe("24:00:00");
  });

  it("pads every field", () => {
    expect(formatCountdown(3_661)).toBe("01:01:01");
  });

  it("never renders a negative clock", () => {
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});

describe("faucetErrorName", () => {
  it("maps the contract's custom errors from the message", () => {
    expect(faucetErrorName({ message: "reverted: CooldownActive()" })).toBe(
      "CooldownActive",
    );
    expect(faucetErrorName({ message: "reverted: NotCompliant(0xabc)" })).toBe(
      "NotCompliant",
    );
    expect(faucetErrorName({ message: "reverted: CapExceeded()" })).toBe(
      "CapExceeded",
    );
  });

  it("maps a wallet rejection", () => {
    expect(faucetErrorName({ name: "UserRejectedRequestError" })).toBe(
      "UserRejected",
    );
  });

  it("falls back to Unknown", () => {
    expect(faucetErrorName({ message: "network down" })).toBe("Unknown");
    expect(faucetErrorName(null)).toBe("Unknown");
  });
});

describe("faucetErrorMessage", () => {
  it("explains the cooldown in user terms", () => {
    expect(faucetErrorMessage({ message: "CooldownActive()" })).toBe(
      "Cooldown is still running — one claim per 24 hours per address.",
    );
  });

  it("keeps the original message for unknown errors", () => {
    expect(faucetErrorMessage(new Error("RPC exploded"))).toBe("RPC exploded");
  });
});
