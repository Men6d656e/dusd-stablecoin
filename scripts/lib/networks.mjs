// Shared network registry helpers for the repo scripts.
//
// networks.json is the only source of chain metadata. Scripts resolve a
// --network slug (preferred) or a --chain-id (compatibility escape hatch) to
// the same object, and fail loudly when the two disagree.

import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

export const NETWORKS = JSON.parse(
  readFileSync(path.join(repoRoot, "networks.json"), "utf8"),
);

export const NETWORK_SLUGS = Object.keys(NETWORKS);

export function parseFlags(argv = process.argv.slice(2)) {
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }
  return flags;
}

export function networkForChainId(chainId) {
  const id = String(chainId);
  return NETWORK_SLUGS.find((slug) => String(NETWORKS[slug].chainId) === id);
}

/**
 * Resolve a network slug from --network / --chain-id (or NETWORK / CHAIN_ID).
 * Returns { slug, chainId, config }.
 */
export function resolveNetwork({ network, chainId } = {}) {
  const slug = network ? String(network) : undefined;
  const rawChainId = chainId ? String(chainId) : undefined;

  if (slug && !NETWORKS[slug]) {
    throw new Error(
      `unknown network "${slug}". Use one of: ${NETWORK_SLUGS.join(", ")}`,
    );
  }

  if (slug) {
    const expected = String(NETWORKS[slug].chainId);
    if (rawChainId && rawChainId !== expected) {
      throw new Error(
        `--network ${slug} is chain ${expected}, but --chain-id ${rawChainId} was given`,
      );
    }
    return { slug, chainId: NETWORKS[slug].chainId, config: NETWORKS[slug] };
  }

  if (rawChainId) {
    const found = networkForChainId(rawChainId);
    if (!found) {
      throw new Error(
        `unknown chain id ${rawChainId}. Known: ${NETWORK_SLUGS.map(
          (name) => `${name} (${NETWORKS[name].chainId})`,
        ).join(", ")}`,
      );
    }
    return { slug: found, chainId: NETWORKS[found].chainId, config: NETWORKS[found] };
  }

  throw new Error(
    `pass --network <${NETWORK_SLUGS.join("|")}> (or --chain-id <id> for compatibility)`,
  );
}

export function deploymentPath(slug) {
  return path.join(repoRoot, "deployments", slug, "deployment.json");
}

export function webDeploymentPath(slug) {
  return path.join(
    repoRoot,
    "web",
    "src",
    "lib",
    "deployments",
    slug,
    "deployment.json",
  );
}

export function webAbiDir(slug) {
  return path.join(repoRoot, "web", "src", "lib", "abi", slug);
}

export function contractArtifactDir() {
  return path.join(repoRoot, "contracts", "out");
}

export { repoRoot };
