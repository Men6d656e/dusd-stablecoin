import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "viem";
import compliance from "./src/lib/abi/base-sepolia/CompliancePolicy.json";
import dusd from "./src/lib/abi/base-sepolia/dUSD.json";
import controller from "./src/lib/abi/base-sepolia/MintRedeemController.json";
import usdc from "./src/lib/abi/base-sepolia/MockUSDC.json";
import vault from "./src/lib/abi/base-sepolia/ReserveVault.json";
import faucet from "./src/lib/abi/base-sepolia/TokenFaucet.json";

// ABI-only codegen. Addresses are deployment data, resolved at runtime from
// NEXT_PUBLIC_NETWORK; baking them here is what made the old app single-network.
// The Base Sepolia snapshot is the canonical audited interface set.
export default defineConfig({
  out: "src/generated/contracts.ts",
  contracts: [
    { name: "dUSD", abi: dusd as Abi },
    { name: "MockUSDC", abi: usdc as Abi },
    { name: "MintRedeemController", abi: controller as Abi },
    { name: "ReserveVault", abi: vault as Abi },
    { name: "TokenFaucet", abi: faucet as Abi },
    { name: "CompliancePolicy", abi: compliance as Abi },
  ],
  plugins: [react()],
});
