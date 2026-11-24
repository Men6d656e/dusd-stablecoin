#!/usr/bin/env node
// Copy the generated ABIs and the deployment file into the web app.
//
// This is a no-op until web/ exists (phase 3, module W1). It never fails the
// deploy on a missing web app: the addresses on chain are already the source of
// truth, and the export in deployments/ is committed.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");

function fail(message) {
  console.error(`sync-artifacts: ${message}`);
  process.exit(1);
}

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} needs a value`);
  return value;
}

const chainId = String(argValue("--chain-id", process.env.CHAIN_ID ?? ""));
if (!/^\d+$/.test(chainId)) {
  fail("pass --chain-id <id>, for example --chain-id 84532");
}

const deploymentPath = path.join(repoRoot, "deployments", `${chainId}.json`);
if (!existsSync(deploymentPath)) {
  fail(
    `no deployment at deployments/${chainId}.json; run make export CHAIN_ID=${chainId} first`,
  );
}

const webDir = path.join(repoRoot, "web");
if (!existsSync(path.join(webDir, "package.json"))) {
  console.log("sync-artifacts: web/ is not scaffolded yet - skipping (no-op)");
  console.log(`  deployment is ready at deployments/${chainId}.json`);
  process.exit(0);
}

const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
const abiDir = path.join(webDir, "src", "lib", "abi");
const deploymentsDir = path.join(webDir, "src", "lib", "deployments");
mkdirSync(abiDir, { recursive: true });
mkdirSync(deploymentsDir, { recursive: true });

const copied = [];
for (const name of Object.keys(deployment.contracts)) {
  const artifactPath = path.join(
    repoRoot,
    "contracts",
    "out",
    `${name}.sol`,
    `${name}.json`,
  );
  if (!existsSync(artifactPath)) {
    fail(`missing artifact ${path.relative(repoRoot, artifactPath)}; run forge build`);
  }
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  writeFileSync(
    path.join(abiDir, `${name}.json`),
    `${JSON.stringify(artifact.abi, null, 2)}\n`,
  );
  copied.push(name);
}

writeFileSync(
  path.join(deploymentsDir, `${chainId}.json`),
  `${JSON.stringify(deployment, null, 2)}\n`,
);

console.log(`synced ${copied.length} ABIs and deployments/${chainId}.json into web/src/lib`);
for (const name of copied) console.log(`  ${name}`);
