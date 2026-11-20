# dUSD contracts

Foundry project for the dUSD fiat-backed stablecoin case study.

- Collateral: mock USDC (`mUSDC`, 6 decimals), Base Sepolia
- Token: dUSD (18 decimals)
- Peg rule: 1 dUSD = 1 DEMO-USD
- Testnet only. No real money. Not audited.

## Build and test

    forge build --sizes
    forge test -vvv
    forge fmt --check
    forge lint

## Deploy MockUSDC locally

    anvil
    forge script script/DeployMockUSDC.s.sol:DeployMockUSDC \
      --rpc-url http://127.0.0.1:8545 --broadcast

## Deploy MockUSDC to Base Sepolia

Use a Foundry keystore, never a private key on the command line:

    cast wallet import deployer --interactive
    forge script script/DeployMockUSDC.s.sol:DeployMockUSDC \
      --rpc-url "$BASE_SEPOLIA_RPC_URL" \
      --account deployer --sender "$DEPLOYER_ADDRESS" \
      --broadcast --verify --slow

Record the printed address. Seed liquidity is a deliberate mint, not part of the
deploy script:

    cast send <MUSDC_ADDRESS> "mint(address,uint256)" \
      "$DEPLOYER_ADDRESS" 100000000000 \
      --rpc-url "$BASE_SEPOLIA_RPC_URL" --account deployer

`100000000000` is 100,000 mUSDC in 6-decimal base units.

## Deploy ReserveVault

    MUSDC_ADDRESS=<MUSDC_ADDRESS> \
    forge script script/DeployReserveVault.s.sol:DeployReserveVault \
      --rpc-url http://127.0.0.1:8545 --broadcast

The vault stays inert until the owner calls `setController`.

## Layout

- `src/` contracts
- `test/unit/` unit and fuzz tests
- `test/invariant/` invariants (added with the full system)
- `script/` deployment scripts
- `lib/` dependencies (git submodules)
