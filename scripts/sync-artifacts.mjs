#!/usr/bin/env node
// Copy the generated ABIs and the deployment manifest into the web app.
//
// Safety rule: a public-testnet snapshot is an audit record, not a build cache.
// If the addresses or the ABI hash changed, this script refuses to overwrite
// the snapshot unless FORCE=1 is set. Local Anvil snapshots can be refreshed
// freely.

import { existsSync } from "node:fs";
import path from "node:path";
import {
  CONTRACTS,
  hashAbiMap,
  readArtifactAbiMap,
  readJson,
  sameContracts,
  writeJsonAtomic,
} from "./lib/abi.mjs";
import {
  contractArtifactDir,
  deploymentPath,
  parseFlags,
  repoRoot,
  resolveNetwork,
  webAbiDir,
  webDeploymentPath,
} from "./lib/networks.mjs";

function fail(message) {
  console.error(`sync-artifacts: ${message}`);
  process.exit(1);
}

const flags = parseFlags();
const force = Boolean(flags.force) || process.env.FORCE === "1";

let target;
try {
  target = resolveNetwork({
    network: flags.network ?? process.env.NETWORK,
    chainId: flags["chain-id"] ?? process.env.CHAIN_ID,
  });
} catch (error) {
  fail(error.message);
}

const { slug, chainId, config } = target;
const manifestPath = deploymentPath(slug);

if (!existsSync(manifestPath)) {
  fail(`no manifest at ${path.relative(repoRoot, manifestPath)}; run make export NETWORK=${slug} first`);
}

const deployment = readJson(manifestPath);
if (deployment.network !== slug || deployment.chainId !== chainId) {
  fail(
    `manifest says ${deployment.network}/${deployment.chainId}, expected ${slug}/${chainId}`,
  );
}

const webDir = path.join(repoRoot, "web");
if (!existsSync(path.join(webDir, "package.json"))) {
  console.log("sync-artifacts: web/ is not scaffolded yet - skipping (no-op)");
  console.log(`  manifest is ready at ${path.relative(repoRoot, manifestPath)}`);
  process.exit(0);
}

const abiMap = readArtifactAbiMap(contractArtifactDir());
if (!abiMap) {
  fail("contracts/out is incomplete; run: make build");
}
const currentAbiHash = hashAbiMap(abiMap);

const isPublicNetwork = config.tier !== "local";
const snapshotPath = webDeploymentPath(slug);

if (isPublicNetwork && !force && existsSync(snapshotPath)) {
  const previous = readJson(snapshotPath);
  const addressesChanged = !sameContracts(previous.contracts, deployment.contracts);
  const abiChanged = previous.provenance?.abiHash !== deployment.provenance.abiHash;

  if (addressesChanged || abiChanged) {
    fail(
      `refusing to overwrite the ${slug} web snapshot ` +
        `(addressesChanged=${addressesChanged}, abiChanged=${abiChanged}).\n` +
        `  This snapshot is the audit record of a real deployment.\n` +
        `  Re-deploy with CONFIRM=1, or pass FORCE=1 if you are intentionally refreshing it.`,
    );
  }
}

if (isPublicNetwork && !force && currentAbiHash !== deployment.provenance.abiHash) {
  fail(
    `contracts/out no longer matches the ABI hash in ${slug}/deployment.json.\n` +
      `  deployed: ${deployment.provenance.abiHash}\n` +
      `  current:  ${currentAbiHash}\n` +
      `  Re-deploy, or pass FORCE=1 to snapshot the current build.`,
  );
}

for (const name of CONTRACTS) {
  writeJsonAtomic(path.join(webAbiDir(slug), `${name}.json`), abiMap[name]);
}

writeJsonAtomic(snapshotPath, deployment);

console.log(`synced ${CONTRACTS.length} ABIs and ${slug}/deployment.json into web/src/lib`);
console.log(`  abi        ${currentAbiHash}`);
for (const name of CONTRACTS) console.log(`  ${name}`);
