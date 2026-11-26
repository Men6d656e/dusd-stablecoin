import { NETWORKS, type NetworkSlug } from "../networks.generated";
import anvilRaw from "./anvil/deployment.json";
import baseSepoliaRaw from "./base-sepolia/deployment.json";
import { type Deployment, deploymentSchema } from "./schema";

const RAW = {
  anvil: anvilRaw,
  "base-sepolia": baseSepoliaRaw,
} as const;

/**
 * Parse and validate one network's manifest. Both values must agree with the
 * registry; a mismatch is a build error, not a runtime surprise.
 */
export function getDeployment(network: NetworkSlug): Deployment {
  const deployment = deploymentSchema.parse(RAW[network]);

  if (deployment.network !== network) {
    throw new Error(
      `Deployment for "${network}" declares network "${deployment.network}"`,
    );
  }

  const expectedChainId = NETWORKS[network].chainId;
  if (deployment.chainId !== expectedChainId) {
    throw new Error(
      `Deployment for "${network}" declares chain ${deployment.chainId}, registry says ${expectedChainId}`,
    );
  }

  return deployment;
}

export type { Deployment };
