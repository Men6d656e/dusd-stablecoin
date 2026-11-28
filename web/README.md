# dUSD web

Next.js app for the dUSD case study. It reads one deployment selected by
`NEXT_PUBLIC_NETWORK`; the ABI is shared, the addresses are per network.

## Run

From the repository root (recommended — the Makefile checks manifests and the
network stamp):

```bash
make web NETWORK=anvil          # local chain
make web NETWORK=base-sepolia   # real testnet, read-only demo
```

Or directly:

```bash
pnpm install
NEXT_PUBLIC_NETWORK=anvil pnpm dev
```

`NEXT_PUBLIC_*` is inlined at build time, so a running bundle cannot change
chains. `make web` clears `.next` when `NETWORK` differs from
`web/.next/active-network`; `make web-clean` does it manually.

## Environment

| Variable              | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_NETWORK` | `anvil` (default) or `base-sepolia`               |
| `NEXT_PUBLIC_RPC_URL` | Optional RPC override for the active network only |
| `NEXT_PUBLIC_E2E`     | `1` enables the mock connector used by Playwright |

Copy `.env.example` to `.env.local` if you need an override. Do not add secrets:
everything prefixed `NEXT_PUBLIC_` ships to the browser.

## Layout

```text
src/lib/networks.generated.ts   generated from ../networks.json — do not edit
src/lib/networks.ts             the only place the app reads the env
src/lib/mint.ts                 mint parsing, approval and error mapping
src/components/MintPanel.tsx    approve → mint flow (W5)
src/lib/deployments/            per-network manifests + schema + getDeployment()
src/lib/abi/<network>/          ABI snapshots the app builds from
src/lib/wagmi/config.ts         both chains, per-network storage key
src/generated/contracts.ts      ABI-only wagmi hooks (address passed at call site)
src/app/api/health/route.ts     expected vs actual chain id, 503 on mismatch
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e        # mock connector
pnpm test:e2e:fork   # real write path on an Anvil fork of Base Sepolia
```

`/api/health` is the truth detector: `expectedChainId` must equal
`actualChainId`. If it returns 503, the selected network and the RPC disagree.

Full command matrix and artifact rules: [../RUNBOOK.md](../RUNBOOK.md).
