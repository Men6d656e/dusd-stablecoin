#!/usr/bin/env node
// Ask Etherscan V2 whether each deployed contract has verified source code.
// One key covers every chain; Base Sepolia uses chainid 84532.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");

function fail(message) {
  console.error(`check-verification: ${message}`);
  process.exit(1);
}

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} needs a value`);
  return value;
}

const chainId = String(argValue("--chain-id", process.env.CHAIN_ID ?? "84532"));
const apiKey = process.env.BASESCAN_API_KEY;
if (!apiKey) fail("BASESCAN_API_KEY is empty; put an Etherscan V2 key in contracts/.env");

const deploymentPath = path.join(repoRoot, "deployments", `${chainId}.json`);
if (!existsSync(deploymentPath)) {
  fail(`no deployment at deployments/${chainId}.json`);
}
const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));

const endpoint = "https://api.etherscan.io/v2/api";
let unverified = 0;

for (const [name, address] of Object.entries(deployment.contracts)) {
  const url = new URL(endpoint);
  url.searchParams.set("chainid", chainId);
  url.searchParams.set("module", "contract");
  url.searchParams.set("action", "getsourcecode");
  url.searchParams.set("address", address);
  url.searchParams.set("apikey", apiKey);

  let verdict = "unverified";
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    const result = Array.isArray(body.result) ? body.result[0] : null;
    if (result && typeof result.SourceCode === "string" && result.SourceCode !== "") {
      verdict = "verified";
    } else if (!result) {
      const detail =
        typeof body.result === "string" ? body.result : body.message;
      verdict = `error: ${detail ?? response.status}`;
    }
  } catch (error) {
    verdict = `error: ${error.message}`;
  }

  if (verdict !== "verified") unverified += 1;
  console.log(`${name.padEnd(22)} ${address}  ${verdict}`);
}

if (unverified > 0) {
  console.error(
    `\n${unverified} contract(s) not verified. Re-run: make deploy-sepolia (forge retries --verify), ` +
      `or verify manually with forge verify-contract --watch.`,
  );
  process.exit(1);
}
console.log("\nall contracts verified");
