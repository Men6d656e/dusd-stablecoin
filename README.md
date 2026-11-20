# dUSD — a fiat-backed stablecoin case study

1 dUSD = 1 DEMO-USD · Base Sepolia · **Testnet only · No real money**

dUSD is a USD-pegged ERC-20 collateralized 1:1 by mock USDC (`mUSDC`) held in an
on-chain reserve vault. Foundry contracts, a Next.js app, live proof-of-reserves,
and an explicit list of what is simulated.

**Status:** building. `MockUSDC` collateral is implemented and tested with Foundry
(9 tests). The reserve vault, dUSD token, and web app are next.

## What is real and what is simulated

| Layer | Real? |
|-------|-------|
| Contracts, transactions, token balances | Real on a public testnet |
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
