import { z } from "zod";
import raw from "./84532.json";

const address = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "must be a 20-byte hex address");

export const deploymentSchema = z.object({
  chainId: z.literal(84532),
  chain: z.string(),
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
  }),
});

export const deployment = deploymentSchema.parse(raw);
export type Deployment = z.infer<typeof deploymentSchema>;
