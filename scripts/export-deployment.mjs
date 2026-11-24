#!/usr/bin/env node
// Export the latest DeployAll broadcast into deployments/<chainId>.json.
//
// Why this exists: Forge already records every CREATE with its contract name and
// address in contracts/broadcast/DeployAll.s.sol/<chainId>/run-latest.json.
// Parsing that file is deterministic; scraping console output or copying
// addresses by hand is not. Run it after every deploy.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const EXPECTED = [
  "MockUSDC",
  "CompliancePolicy",
  "ReserveVault",
  "dUSD",
  "MintRedeemController",
  "TokenFaucet",
  "FixedPriceSource",
];

const CHAIN_NAMES = {
  31337: "anvil",
  84532: "base-sepolia",
  8453: "base",
};

const repoRoot = path.resolve(import.meta.dirname, "..");

function fail(message) {
  console.error(`export-deployment: ${message}`);
  process.exit(1);
}

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} needs a value`);
  return value;
}

function checksum(address) {
  if (!address) return address;
  const cast = spawnSync("cast", ["to-check-sum-address", address], {
    encoding: "utf8",
  });
  return cast.status === 0 ? cast.stdout.trim() : address;
}

const chainId = String(argValue("--chain-id", process.env.CHAIN_ID ?? ""));
if (!/^\d+$/.test(chainId)) {
  fail("pass --chain-id <id>, for example --chain-id 84532");
}

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
      `  run the deploy first:  make deploy-sepolia   (or make deploy-local)`,
  );
}

const broadcast = JSON.parse(readFileSync(broadcastPath, "utf8"));

if (String(broadcast.chain) !== chainId) {
  fail(
    `broadcast chain ${broadcast.chain} does not match --chain-id ${chainId}`,
  );
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
  if (!EXPECTED.includes(tx.contractName)) continue;
  if (creates.has(tx.contractName)) {
    fail(`DeployAll created ${tx.contractName} twice; refusing to guess`);
  }
  creates.set(tx.contractName, tx.contractAddress);
}

const missing = EXPECTED.filter((name) => !creates.has(name));
if (missing.length > 0) {
  fail(`broadcast is missing: ${missing.join(", ")}`);
}

const blockNumbers = (broadcast.receipts ?? [])
  .map((r) => Number.parseInt(r.blockNumber, 16))
  .filter(Number.isFinite);
const deployer = checksum((broadcast.receipts ?? [])[0]?.from ?? null);

const contracts = Object.fromEntries(
  EXPECTED.map((name) => [name, checksum(creates.get(name))]),
);

const deployment = {
  chainId: Number(chainId),
  chain: CHAIN_NAMES[chainId] ?? `chain-${chainId}`,
  deployer,
  blockNumber: blockNumbers.length
    ? Math.max(...blockNumbers)
    : null,
  deployedAt: new Date(broadcast.timestamp).toISOString(),
  contracts,
  provenance: {
    script: "contracts/script/DeployAll.s.sol:DeployAll",
    broadcast: path.relative(repoRoot, broadcastPath),
    commit: broadcast.commit ?? null,
  },
};

const outDir = path.join(repoRoot, "deployments");
const outPath = path.join(outDir, `${chainId}.json`);
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(deployment, null, 2)}\n`);

console.log(`wrote ${path.relative(repoRoot, outPath)}`);
console.log(`  chain      ${deployment.chain} (${deployment.chainId})`);
console.log(`  deployer   ${deployment.deployer}`);
console.log(`  block      ${deployment.blockNumber}`);
for (const [name, address] of Object.entries(contracts)) {
  console.log(`  ${name.padEnd(22)} ${address}`);
}
