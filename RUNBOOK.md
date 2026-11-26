# Runbook — network targets, artifacts, and "which chain am I on?"

One page for the W4.1 network-target switch. The short version: **`NETWORK` is
required**, the ABI is code, the address is a deployment, and the chain id is
context.

## 1. Glossary

| Term | Meaning | Example |
|---|---|---|
| **Network target** | A chain plus one active deployment on it | `anvil`, `base-sepolia` |
| **Deployment** | One set of contract addresses on one network | `deployments/base-sepolia/deployment.json` |
| **Artifact** | Compiler output: ABI + bytecode | `contracts/out/TokenFaucet.sol/TokenFaucet.json` |
| **ABI snapshot** | Frozen ABI the web app builds from | `web/src/lib/abi/base-sepolia/TokenFaucet.json` |
| **Manifest** | Per-network audit record: chain, addresses, deployer, block, commit, ABI hash | `deployments/<network>/deployment.json` |
| **Selector** | The single env value that chooses the manifest | `NEXT_PUBLIC_NETWORK=anvil` |
| **Run mode** | How the web process runs | `pnpm dev` vs `pnpm build && pnpm start` |
| **Fork mode** | Anvil copying Base Sepolia state, same chain id | `make e2e-fork` |

`contracts/out` is a **cache**. `deployments/<network>/` is the **record**.
`web/src/lib/abi/<network>/` is the **runtime snapshot**.

## 2. Command matrix

| Intent | Command |
|---|---|
| Start a clean local chain | `make anvil` |
| Deploy locally + export + sync | `make deploy NETWORK=anvil` |
| Deploy the real testnet (gated) | `make deploy NETWORK=base-sepolia CONFIRM=1` |
| Rebuild manifests/snapshots only | `make sync NETWORK=anvil` |
| Check Etherscan verification | `make verify-status NETWORK=base-sepolia` |
| Local chain + hot reload | `make web NETWORK=anvil` |
| Local chain + production bundle | `make web-build NETWORK=anvil && make web-start NETWORK=anvil` |
| Testnet + hot reload (read-only demo) | `make web NETWORK=base-sepolia` |
| Testnet + production bundle | `make web-build NETWORK=base-sepolia && make web-start NETWORK=base-sepolia` |
| Browser smoke (mock connector) | `make e2e NETWORK=anvil` |
| Real write path on a fork | `make e2e-fork` |
| One-command clean room | `make reset NETWORK=anvil` |
| Artifact / ABI / registry audit | `make artifacts-check` |

## 3. Switching networks (the clean refresh)

`NEXT_PUBLIC_*` is inlined at build time, so a running bundle cannot change
chains. `make web` and `make web-start` compare `NETWORK` with
`web/.next/active-network` and clear `.next` + `tsconfig.tsbuildinfo` when it
changes. That is the "clean refresh" — no manual `rm -rf` required.

If in doubt:

```bash
make web-clean
make web NETWORK=anvil
```

## 4. Which chain am I on?

1. `curl -s localhost:3000/api/health | jq` — `status` must be `ok` and
   `expectedChainId` must equal `actualChainId`.
2. The amber banner shows the label, chain id, and safety tier.
3. The header shows the active network.
4. `cat web/.next/active-network` shows the last built network.
5. `git status` must be clean after a testnet deploy except for the intentional
   manifest and snapshot changes.

## 5. Artifact rules

- A local build may refresh `deployments/anvil/` and `web/src/lib/abi/anvil/`.
- `deployments/base-sepolia/` and `web/src/lib/abi/base-sepolia/` are an audit
  record. `sync` refuses to overwrite them when addresses or the ABI hash
  changed, unless `FORCE=1`.
- `make artifacts-check` fails when:
  - a manifest disagrees with `networks.json`;
  - a web snapshot disagrees with its manifest;
  - the web ABI hash differs from the manifest's `abiHash`;
  - the two networks' ABIs differ (interfaces must be one set);
  - `31337` / `84532` appears in `web/src` outside the registry, manifests,
    generated files, or tests.
- `web/src/lib/networks.generated.ts` is generated from `networks.json`. Edit
  the JSON, then run `node scripts/generate-web-networks.mjs`.

## 6. Environment

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_NETWORK` | web | `anvil` (default) or `base-sepolia` |
| `NEXT_PUBLIC_RPC_URL` | web | Optional override for the active network only |
| `RPC_URL` | make | Explicit web RPC override; empty by default so `.env.local` cannot leak across networks |
| `NEXT_PUBLIC_E2E` | web | `1` enables the mock connector in tests |
| `BASE_SEPOLIA_RPC_URL` | contracts | Testnet deploy RPC |
| `DEPLOYER_ADDRESS` | contracts | Keystore account address |
| `BASESCAN_API_KEY` | contracts | Etherscan V2 key (verification) |

Secrets stay in `contracts/.env` and the Foundry keystore. Only `NEXT_PUBLIC_*`
values reach the browser, and those are public by definition.
