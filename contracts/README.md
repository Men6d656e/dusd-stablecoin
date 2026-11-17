# dUSD contracts

Foundry project for the dUSD fiat-backed stablecoin case study.

- Collateral: mock USDC (6 decimals), Base Sepolia
- Token: dUSD (18 decimals)
- Peg rule: 1 dUSD = 1 DEMO-USD
- Testnet only. No real money. Not audited.

## Build and test

    forge build
    forge test -vvv

## Deploy locally

    anvil
    forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast

## Deploy to Base Sepolia

Use a Foundry keystore, never a private key on the command line:

    cast wallet import deployer --interactive
    forge script script/Deploy.s.sol:Deploy \
      --rpc-url "$BASE_SEPOLIA_RPC_URL" \
      --account deployer --sender "$DEPLOYER_ADDRESS" \
      --broadcast --verify --slow

## Layout

- `src/` contracts
- `test/` unit, fuzz, invariant tests
- `script/` deployment scripts
- `lib/` dependencies (git submodules)
