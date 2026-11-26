import { getDeployment } from "./deployments";
import { activeChainId, activeNetwork } from "./networks";

export const CHAIN_ID = activeChainId;
export const deployment = getDeployment(activeNetwork);
export const contracts = deployment.contracts;

export const dusdAddress = contracts.dUSD;
export const usdcAddress = contracts.MockUSDC;
export const vaultAddress = contracts.ReserveVault;
export const controllerAddress = contracts.MintRedeemController;
export const faucetAddress = contracts.TokenFaucet;
export const policyAddress = contracts.CompliancePolicy;
