import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDeployment } from "./deployments";
import { explorerTxUrl, safetyLabel, tierLabel } from "./networks";
import { NETWORKS, type NetworkSlug } from "./networks.generated";

const rootRegistry = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "..", "networks.json"), "utf8"),
);

describe("network registry", () => {
  it("stays in sync with the root networks.json", () => {
    expect(NETWORKS).toEqual(rootRegistry);
  });

  it("has a valid manifest for every registered network", () => {
    for (const slug of Object.keys(NETWORKS) as NetworkSlug[]) {
      const deployment = getDeployment(slug);
      expect(deployment.network).toBe(slug);
      expect(deployment.chainId).toBe(NETWORKS[slug].chainId);
      expect(deployment.provenance.abiHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("builds explorer links only where an explorer exists", () => {
    expect(explorerTxUrl("base-sepolia", "0xabc")).toBe(
      "https://sepolia.basescan.org/tx/0xabc",
    );
    expect(explorerTxUrl("anvil", "0xabc")).toBeNull();
  });

  it("labels the two axes separately", () => {
    expect(tierLabel("anvil")).toBe("local");
    expect(tierLabel("base-sepolia")).toBe("testnet");
    expect(safetyLabel("anvil")).toBe("Local chain");
    expect(safetyLabel("base-sepolia")).toBe("Testnet only");
  });
});
