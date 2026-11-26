#!/usr/bin/env node
// Ask Etherscan V2 whether each deployed contract has verified source code.
// One key covers every chain. Local networks have no explorer, so they skip
// cleanly instead of failing a deploy.

import { existsSync } from "node:fs";
import path from "node:path";
import { readJson } from "./lib/abi.mjs";
import {
  deploymentPath,
  parseFlags,
  repoRoot,
  resolveNetwork,
} from "./lib/networks.mjs";

function fail(message) {
  console.error(`check-verification: ${message}`);
  process.exit(1);
}

const flags = parseFlags();

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

if (config.tier === "local" || !config.explorerTxUrl) {
  console.log(`check-verification: ${slug} has no block explorer - nothing to verify`);
  process.exit(0);
}

const apiKey = process.env.BASESCAN_API_KEY;
if (!apiKey) {
  fail("BASESCAN_API_KEY is empty; put an Etherscan V2 key in contracts/.env");
}

const manifestPath = deploymentPath(slug);
if (!existsSync(manifestPath)) {
  fail(`no manifest at ${path.relative(repoRoot, manifestPath)}`);
}
const deployment = readJson(manifestPath);

const endpoint = "https://api.etherscan.io/v2/api";
let unverified = 0;

for (const [name, address] of Object.entries(deployment.contracts)) {
  const url = new URL(endpoint);
  url.searchParams.set("chainid", String(chainId));
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
    `\n${unverified} contract(s) not verified. Re-run: make deploy NETWORK=${slug} CONFIRM=1, ` +
      `or verify manually with forge verify-contract --watch.`,
  );
  process.exit(1);
}
console.log("\nall contracts verified");
