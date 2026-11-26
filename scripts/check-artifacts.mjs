#!/usr/bin/env node
// Read-only consistency check across the registry, manifests, and web snapshots.
//
// Fails when:
//   - a manifest or web snapshot is missing or disagrees with networks.json;
//   - the web ABI snapshot hash no longer matches the manifest's abiHash;
//   - the per-network ABI snapshots differ (interfaces must be one set);
//   - a source file hardcodes 31337 / 84532 outside the registry, manifests,
//     generated files, or tests.
//
// Run: make artifacts-check   (or node scripts/check-artifacts.mjs)

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  CONTRACTS,
  hashAbiMap,
  readAbiMap,
  readJson,
  sameContracts,
} from "./lib/abi.mjs";
import {
  NETWORKS,
  NETWORK_SLUGS,
  deploymentPath,
  parseFlags,
  repoRoot,
  resolveNetwork,
  webAbiDir,
  webDeploymentPath,
} from "./lib/networks.mjs";

const flags = parseFlags();
const only = flags.network ?? process.env.NETWORK;
const problems = [];

function problem(message) {
  problems.push(message);
}

let slugs = NETWORK_SLUGS;
if (only) {
  try {
    slugs = [resolveNetwork({ network: only }).slug];
  } catch (error) {
    console.error(`check-artifacts: ${error.message}`);
    process.exit(1);
  }
}

const abiMaps = {};

for (const slug of slugs) {
  const chainId = NETWORKS[slug].chainId;
  const manifestFile = deploymentPath(slug);

  if (!existsSync(manifestFile)) {
    problem(`${slug}: missing ${path.relative(repoRoot, manifestFile)}`);
    continue;
  }

  const manifest = readJson(manifestFile);
  if (manifest.network !== slug) {
    problem(`${slug}: manifest says network "${manifest.network}"`);
  }
  if (manifest.chainId !== chainId) {
    problem(`${slug}: manifest says chain ${manifest.chainId}, networks.json says ${chainId}`);
  }
  for (const name of CONTRACTS) {
    if (!manifest.contracts?.[name]) problem(`${slug}: manifest is missing ${name}`);
  }
  if (!manifest.provenance?.abiHash) {
    problem(`${slug}: manifest has no provenance.abiHash`);
  }

  const snapshotFile = webDeploymentPath(slug);
  if (!existsSync(snapshotFile)) {
    problem(`${slug}: missing web snapshot ${path.relative(repoRoot, snapshotFile)}`);
  } else {
    const snapshot = readJson(snapshotFile);
    if (snapshot.chainId !== manifest.chainId) {
      problem(`${slug}: web snapshot chain ${snapshot.chainId} != manifest ${manifest.chainId}`);
    }
    if (!sameContracts(snapshot.contracts, manifest.contracts)) {
      problem(`${slug}: web snapshot addresses differ from the manifest`);
    }
    if (snapshot.provenance?.abiHash !== manifest.provenance?.abiHash) {
      problem(`${slug}: web snapshot abiHash differs from the manifest`);
    }
  }

  const abiMap = readAbiMap(webAbiDir(slug));
  if (!abiMap) {
    problem(`${slug}: web ABI snapshot is incomplete (${path.relative(repoRoot, webAbiDir(slug))})`);
    continue;
  }
  abiMaps[slug] = abiMap;

  const hash = hashAbiMap(abiMap);
  if (manifest.provenance?.abiHash && hash !== manifest.provenance.abiHash) {
    problem(`${slug}: web ABI hash ${hash} != manifest ${manifest.provenance.abiHash}`);
  }
}

const checked = Object.keys(abiMaps);
if (checked.length > 1) {
  const [first, ...rest] = checked;
  for (const other of rest) {
    for (const name of CONTRACTS) {
      const a = JSON.stringify(abiMaps[first][name]);
      const b = JSON.stringify(abiMaps[other][name]);
      if (a !== b) {
        problem(`${name}: ABI differs between ${first} and ${other}; interfaces must be one set`);
      }
    }
  }
}

// Hardcoded chain ids belong only in the registry, manifests, generated files,
// and tests. Everything else must read the resolver.
const ALLOWED_PREFIXES = [
  "web/src/lib/networks.generated.ts",
  "web/src/lib/deployments/",
  "web/src/lib/abi/",
];
const ALLOWED_FILE = /\.(test|spec)\.(ts|tsx)$/;

function walk(dir) {
  const entries = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) entries.push(...walk(full));
    else entries.push(full);
  }
  return entries;
}

const srcDir = path.join(repoRoot, "web", "src");
if (existsSync(srcDir)) {
  for (const file of walk(srcDir)) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const relative = path.relative(repoRoot, file);
    if (ALLOWED_FILE.test(file)) continue;
    if (ALLOWED_PREFIXES.some((prefix) => relative.startsWith(prefix))) continue;
    if (/\b(31337|84532)\b/.test(readFileSync(file, "utf8"))) {
      problem(`${relative}: hardcoded chain id; read it from @/lib/networks instead`);
    }
  }
}

if (problems.length > 0) {
  console.error("artifacts-check failed:");
  for (const entry of problems) console.error(`  - ${entry}`);
  process.exit(1);
}

console.log(`artifacts-check: ${checked.join(", ")} consistent`);
