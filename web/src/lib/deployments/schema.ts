import type { Address } from "viem";
import { z } from "zod";

const address = z.custom<Address>(
  (value) =>
    typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value),
  "must be a 20-byte hex address",
);

export const deploymentSchema = z.object({
  network: z.enum(["anvil", "base-sepolia"]),
  chainId: z.number().int().positive(),
  deployer: address,
  blockNumber: z.number().int().positive(),
  deployedAt: z.string(),
  contracts: z.object({
    MockUSDC: address,
    CompliancePolicy: address,
    ReserveVault: address,
    dUSD: address,
    MintRedeemController: address,
    TokenFaucet: address,
    FixedPriceSource: address,
  }),
  provenance: z.object({
    script: z.string(),
    broadcast: z.string(),
    commit: z.string(),
    abiHash: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  }),
});

export type Deployment = z.infer<typeof deploymentSchema>;
