#!/usr/bin/env node
// Export the latest DeployAll broadcast into deployments/<network>/deployment.json.
//
// Forge already records every CREATE with its contract name and address in
// contracts/broadcast/DeployAll.s.sol/<chainId>/run-latest.json. Parsing that
// file is deterministic; scraping console output or copying addresses by hand
// is not. Run it after every deploy.
//
// The manifest is the audit record: network, chain id, deployer, block, commit,
// and the hash of the ABI that was deployed.

import { spawnSync } from "node:child_process";
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
} from "./lib/networks.mjs";

function fail(message) {
  console.error(`export-deployment: ${message}`);
  process.exit(1);
}

function checksum(address) {
  if (!address) return address;
  const cast = spawnSync("cast", ["to-check-sum-address", address], {
    encoding: "utf8",
  });
  return cast.status === 0 ? cast.stdout.trim() : address;
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

const { slug, chainId: numericChainId } = target;
const chainId = String(numericChainId);

const broadcastPath = path.join(
  repoRoot,
  "contracts",
  "broadcast",
  "DeployAll.s.sol",
  chainId,
  "run-latest.json",
);

if (!existsSync(broadcastPath)) {
  fail(
    `no broadcast at ${path.relative(repoRoot, broadcastPath)}\n` +
      `  run the deploy first:  make deploy NETWORK=${slug}`,
  );
}

const broadcast = readJson(broadcastPath);

if (String(broadcast.chain) !== chainId) {
  fail(`broadcast chain ${broadcast.chain} does not match ${slug} (${chainId})`);
}

const failed = (broadcast.receipts ?? []).filter((r) => r.status !== "0x1");
if (failed.length > 0) {
  fail(
    `${failed.length} transaction(s) reverted in the broadcast; nothing was exported`,
  );
}

const creates = new Map();
for (const tx of broadcast.transactions ?? []) {
  if (tx.transactionType !== "CREATE") continue;
  if (!CONTRACTS.includes(tx.contractName)) continue;
  if (creates.has(tx.contractName)) {
    fail(`DeployAll created ${tx.contractName} twice; refusing to guess`);
  }
  creates.set(tx.contractName, tx.contractAddress);
}

const missing = CONTRACTS.filter((name) => !creates.has(name));
if (missing.length > 0) {
  fail(`broadcast is missing: ${missing.join(", ")}`);
}

const abiMap = readArtifactAbiMap(contractArtifactDir());
if (!abiMap) {
  fail("contracts/out is incomplete; run: make build");
}
const abiHash = hashAbiMap(abiMap);

const blockNumbers = (broadcast.receipts ?? [])
  .map((r) => Number.parseInt(r.blockNumber, 16))
  .filter(Number.isFinite);
const deployer = checksum((broadcast.receipts ?? [])[0]?.from ?? null);

const contracts = Object.fromEntries(
  CONTRACTS.map((name) => [name, checksum(creates.get(name))]),
);

const deployment = {
  network: slug,
  chainId: numericChainId,
  deployer,
  blockNumber: blockNumbers.length ? Math.max(...blockNumbers) : null,
  deployedAt: new Date(broadcast.timestamp).toISOString(),
  contracts,
  provenance: {
    script: "contracts/script/DeployAll.s.sol:DeployAll",
    broadcast: path.relative(repoRoot, broadcastPath),
    commit: broadcast.commit ?? null,
    abiHash,
  },
};

const outPath = deploymentPath(slug);

// Protect the audit record: a local rebuild that changes the ABI must not
// silently rewrite the ABI hash of an existing public-testnet deployment.
if (!force && target.config.tier !== "local" && existsSync(outPath)) {
  const previous = readJson(outPath);
  if (
    sameContracts(previous.contracts, contracts) &&
    previous.provenance?.abiHash !== abiHash
  ) {
    fail(
      `contracts/out no longer matches the ABI recorded for the ${slug} deployment.\n` +
        `  recorded: ${previous.provenance?.abiHash}\n` +
        `  current:  ${abiHash}\n` +
        `  Re-deploy, or pass FORCE=1 to rewrite the audit manifest.`,
    );
  }
}

writeJsonAtomic(outPath, deployment);

console.log(`wrote ${path.relative(repoRoot, outPath)}`);
console.log(`  network    ${slug} (${numericChainId})`);
console.log(`  deployer   ${deployment.deployer}`);
console.log(`  block      ${deployment.blockNumber}`);
console.log(`  abi        ${abiHash}`);
for (const [name, address] of Object.entries(contracts)) {
  console.log(`  ${name.padEnd(22)} ${address}`);
}
