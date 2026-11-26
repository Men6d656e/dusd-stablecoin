// ABI helpers shared by export, sync, and artifact checks.
//
// The ABI is code; the address is a deployment. This module keeps one canonical
// contract list and one deterministic hash, so a manifest can prove which ABI
// snapshot it was produced with.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export const CONTRACTS = [
  "MockUSDC",
  "CompliancePolicy",
  "ReserveVault",
  "dUSD",
  "MintRedeemController",
  "TokenFaucet",
  "FixedPriceSource",
];

/** Read the seven ABIs from a directory of `<Name>.json` files. */
export function readAbiMap(dir) {
  const map = {};
  for (const name of CONTRACTS) {
    const file = path.join(dir, `${name}.json`);
    if (!existsSync(file)) return null;
    map[name] = JSON.parse(readFileSync(file, "utf8"));
  }
  return map;
}

/** Read the seven ABIs from Foundry's `contracts/out` artifacts. */
export function readArtifactAbiMap(outDir) {
  const map = {};
  for (const name of CONTRACTS) {
    const file = path.join(outDir, `${name}.sol`, `${name}.json`);
    if (!existsSync(file)) return null;
    map[name] = JSON.parse(readFileSync(file, "utf8")).abi;
  }
  return map;
}

/** Stable hash over the canonical contract order, independent of key order. */
export function hashAbiMap(map) {
  const canonical = CONTRACTS.map((name) => [name, map[name]]);
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonical))
    .digest("hex")}`;
}

export function writeJsonAtomic(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, file);
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function sameContracts(a, b) {
  return CONTRACTS.every((name) => a?.[name] === b?.[name]);
}
