import { deployment } from "./deployments/schema";

export const CHAIN_ID = deployment.chainId;
export const contracts = deployment.contracts;

export const dusdAddress = contracts.dUSD;
export const usdcAddress = contracts.MockUSDC;
export const vaultAddress = contracts.ReserveVault;
export const controllerAddress = contracts.MintRedeemController;
export const faucetAddress = contracts.TokenFaucet;
export const policyAddress = contracts.CompliancePolicy;
