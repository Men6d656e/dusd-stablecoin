# dUSD — a fiat-backed stablecoin case study

1 dUSD = 1 DEMO-USD · Base Sepolia · **Testnet only · No real money**

dUSD is a USD-pegged ERC-20 collateralized 1:1 by mock USDC (`mUSDC`) held in an
on-chain reserve vault. Foundry contracts today; a Next.js app and live
proof-of-reserves next.

**Status:** contracts complete. Seven contracts, 149 Foundry tests (unit, fuzz
and invariant), a formatting and lint gate, and green CI. Deployment to Base
Sepolia and the web app are the next phases. **There are no deployed addresses
yet** — when they exist they land in `deployments/84532.json` and in the address
table below. Until then, do not send funds to any address claiming to be this
project.

## Base Sepolia deployment (2026-11-24)

| Contract | Address | Explorer |
|---|---|---|
| MockUSDC | 0xd5687e74B3c26aA25c2a5985E2Ff974A99Fd563C | https://sepolia.basescan.org/address/0xd5687e74B3c26aA25c2a5985E2Ff974A99Fd563C#code |
| CompliancePolicy | 0x61994d53cadf2cD8786E4ea84Dc497d1ccC755F5 | https://sepolia.basescan.org/address/0x61994d53cadf2cD8786E4ea84Dc497d1ccC755F5#code |
| ReserveVault | 0x0d065884ce8D542510bF6b99B6Da8055e39f3dF5 | https://sepolia.basescan.org/address/0x0d065884ce8D542510bF6b99B6Da8055e39f3dF5#code |
| dUSD | 0x530d583c44E44cc07154741f4D4B4cc9500bfa43 | https://sepolia.basescan.org/address/0x530d583c44E44cc07154741f4D4B4cc9500bfa43#code |
| MintRedeemController | 0xDc042BA286F204231A7aa7bc1eC1208aB03D65C2 | https://sepolia.basescan.org/address/0xDc042BA286F204231A7aa7bc1eC1208aB03D65C2#code |
| TokenFaucet | 0xa10D4D20d9B856f2B8e4152C3e0d1802ADdc06cD | https://sepolia.basescan.org/address/0xa10D4D20d9B856f2B8e4152C3e0d1802ADdc06cD#code |
| FixedPriceSource | 0x4B7C3301b3AeCeE64f8d0622a2fE0813404f3346 | https://sepolia.basescan.org/address/0x4B7C3301b3AeCeE64f8d0622a2fE0813404f3346#code |

## What is built

| Contract | Role | Tests |
|----------|------|-------|
| `MockUSDC` | 6-decimal demo collateral, owner-mintable | unit + fuzz |
| `CompliancePolicy` | allowlist, blocklist, jurisdiction flags | unit + fuzz |
| `ReserveVault` | collateral custody, per-account ledger, controller hook | unit + fuzz |
| `dUSD` | 18-decimal ERC-20, pausable, transfer compliance hook | unit + fuzz |
| `MintRedeemController` | 1:1 mint/redeem with fixed `1e12` scaling | unit + fuzz |
| `TokenFaucet` | demo mUSDC with cooldown and lifetime cap | unit + fuzz |
| `FixedPriceSource` | price seam, no consumer in v1 | unit |

The whole system is exercised by 149 tests, including a reserve invariant suite
(`totalSupply <= totalAssets`, ledger reconciliation, whole-dUSD supply). Contract
details and deployment commands live in [contracts/README.md](contracts/README.md).

## Repository layout

```text
contracts/     Foundry project: src/, test/, script/, lib/
.github/       CI: forge fmt, forge build --sizes, forge test
LICENSE
README.md
```

`deployments/`, `scripts/`, `Makefile` and `web/` arrive with the deployment and
web phases.

## Quick start

```bash
cd contracts
forge test -vvv
forge fmt --check
forge lint
```

The CI profile, which the GitHub Actions job runs:

```bash
cd contracts
FOUNDRY_PROFILE=ci forge test
```

The invariant suite on its own:

```bash
cd contracts
FOUNDRY_PROFILE=ci forge test --match-path "test/invariant/*"
```

## What is real and what is simulated

| Layer | Real? |
|-------|-------|
| Contracts, transactions, token balances | Real once deployed to a public testnet |
| Reserve vault and reserve ratio | Real on-chain, mock asset |
| Fiat, bank, KYC, license, audit | Simulated or absent |

Not audited. Not licensed. Not deployed to mainnet.

## Using this repository

You are welcome to **clone, run, study, and fork** this project.

The repository you are reading is the original. Only its owner can push to it.
If you want to change the code, **fork it** (or clone it) and change your own
copy — your changes never touch this repository unless the owner merges them.

Pull requests against `main` are not accepted for this project; use a fork for
your own experiments.

## License

**MIT.** You may use, copy, modify, and redistribute the code, including in your
own projects, as long as the copyright notice and license text are kept.

That permission applies to **copies**. It does not give anyone write access to
this repository — writing to `main` is controlled by GitHub permissions, not by
the license. See [LICENSE](LICENSE).
