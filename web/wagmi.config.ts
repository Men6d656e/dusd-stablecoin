import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi, Address } from "viem";
import compliance from "./src/lib/abi/CompliancePolicy.json";
import dusd from "./src/lib/abi/dUSD.json";
import controller from "./src/lib/abi/MintRedeemController.json";
import usdc from "./src/lib/abi/MockUSDC.json";
import vault from "./src/lib/abi/ReserveVault.json";
import faucet from "./src/lib/abi/TokenFaucet.json";
import deployments from "./src/lib/deployments/84532.json";

const addresses = deployments.contracts;

export default defineConfig({
  out: "src/generated/contracts.ts",
  contracts: [
    { name: "dUSD", abi: dusd as Abi, address: addresses.dUSD as Address },
    {
      name: "MockUSDC",
      abi: usdc as Abi,
      address: addresses.MockUSDC as Address,
    },
    {
      name: "MintRedeemController",
      abi: controller as Abi,
      address: addresses.MintRedeemController as Address,
    },
    {
      name: "ReserveVault",
      abi: vault as Abi,
      address: addresses.ReserveVault as Address,
    },
    {
      name: "TokenFaucet",
      abi: faucet as Abi,
      address: addresses.TokenFaucet as Address,
    },
    {
      name: "CompliancePolicy",
      abi: compliance as Abi,
      address: addresses.CompliancePolicy as Address,
    },
  ],
  plugins: [react()],
});
