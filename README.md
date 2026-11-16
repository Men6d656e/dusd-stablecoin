# dUSD — a fiat-backed stablecoin case study

1 dUSD = 1 DEMO-USD · Base Sepolia · **Testnet only · No real money**

dUSD is a USD-pegged ERC-20 collateralized 1:1 by mock USDC (`dUSDC`) held in an
on-chain reserve vault. Foundry contracts, a Next.js app, live proof-of-reserves,
and an explicit list of what is simulated.

**Status:** scaffolding. Contracts and web app are not built yet.

## What is real and what is simulated

| Layer | Real? |
|-------|-------|
| Contracts, transactions, token balances | Real on a public testnet |
| Reserve vault and reserve ratio | Real on-chain, mock asset |
| Fiat, bank, KYC, license, audit | Simulated or absent |

Not audited. Not licensed. Not deployed to mainnet.

## License

**All rights reserved.** This is a source-available repository, not open source.
You may read and evaluate the code; you may not use, modify, distribute, or
deploy it without written permission. See [LICENSE](LICENSE).
