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

## Run the invariant suite

    FOUNDRY_PROFILE=ci forge test --match-path "test/invariant/*"

The suite fuzzes claim, mint, redeem, donate, transfer and time-warp against the
wired contracts, then checks five properties: supply never exceeds assets, supply
equals recorded deposits times `1e12`, assets cover deposits, the per-account ledger
sums to `totalDeposits`, and supply is a whole number of dUSD. The CI profile uses
`runs = 500, depth = 100`; the default Foundry profile uses its own defaults.

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

## Deploy dUSD

    DUSD_ADMIN=<ADMIN_ADDRESS> \
    COMPLIANCE_ADDRESS=<COMPLIANCE_ADDRESS> \
    forge script script/DeployDUSD.s.sol:DeployDUSD \
      --rpc-url http://127.0.0.1:8545 --broadcast

`DUSD_ADMIN` is optional; it defaults to the broadcasting sender.
`COMPLIANCE_ADDRESS` is required: the transfer hook needs a policy at deploy time,
and the token rejects a zero policy. Deploy the policy first. Supply starts at
zero. The admin receives all three roles:


| Role | May do | Held by at deploy |
|---|---|---|
| `DEFAULT_ADMIN_ROLE` | grant and revoke every role | `DUSD_ADMIN` |
| `MINTER_ROLE` | `mint` new supply | `DUSD_ADMIN` (later: the controller) |
| `PAUSER_ROLE` | `pause` and `unpause` | `DUSD_ADMIN` |

A pause stops transfers, minting **and** burning, so redemption is blocked while
paused. Pause is an emergency brake, not a routine tool.

There is no supply cap. Supply is elastic and bounded by the reserve invariant
`dUSD.totalSupply() <= vault.totalAssets()`, which the controller and the invariant
tests enforce.

### Transfer hook

Every dUSD transfer checks the policy twice: sender and recipient must both pass
`isAllowed`. A blocked address cannot send tokens it already holds, and nobody can
send tokens to a blocked address. The revert is `TransferNotCompliant(from, to)`,
which names both addresses.

Mint and burn skip the hook because their entry points are already gated: the
controller checks the account before minting or redeeming, and the zero address can
never pass a policy. A blocked holder may still burn its own tokens, which only
reduces supply.

The compliance check runs before the pause check, so a blocked transfer reverts with
`TransferNotCompliant` even while the token is paused.

The policy is immutable. Swapping it means deploying a new token and rewiring the
controller and vault; on this testnet that is a migration, not an upgrade.

## Deploy CompliancePolicy

    COMPLIANCE_ADMIN=<ADMIN_ADDRESS> \
    forge script script/DeployCompliancePolicy.s.sol:DeployCompliancePolicy \
      --rpc-url http://127.0.0.1:8545 --broadcast

`COMPLIANCE_ADMIN` is optional; it defaults to the broadcasting sender. The policy
deploys open: allowlist mode off, jurisdiction checking off, so every address except
the zero address is allowed until an operator decides otherwise.

| Setting | Default | Effect when on |
|---|---|---|
| `allowlistEnabled` | `false` | only allowlisted addresses pass `isAllowed` |
| `jurisdictionCheckEnabled` | `false` | only allowed ISO 3166-1 numeric codes pass |

`COMPLIANCE_ROLE` changes every setting; `DEFAULT_ADMIN_ROLE` grants it. A block
outranks the allowlist and every jurisdiction allowance, so a blocked address is
denied even if it is also listed. There is no pause on the policy: pausing a
compliance gate would be a bypass, and the emergency brake lives in the token and the
controller.

Jurisdiction codes are ISO 3166-1 numeric: `840` United States, `826` United Kingdom,
`050` Bangladesh, `356` India. Zero means "not recorded" and can never be added to the
allowed table.

### Where compliance is enforced

| Path | Enforced |
|---|---|
| Mint dUSD | controller checks `isAllowed` (module 5) |
| Redeem dUSD | controller checks `isAllowed` (module 5) |
| Transfer dUSD | token checks `isAllowed` on sender and recipient |
| Policy changes | `COMPLIANCE_ROLE` on this contract |

An allowlist is not identity verification, and this contract is not a sanctions
screening product. It stores a decision and its audit trail.

## Deploy MintRedeemController

    DUSD_ADDRESS=<DUSD_ADDRESS> \
    VAULT_ADDRESS=<VAULT_ADDRESS> \
    COMPLIANCE_ADDRESS=<COMPLIANCE_ADDRESS> \
    forge script script/DeployMintRedeemController.s.sol:DeployMintRedeemController \
      --rpc-url http://127.0.0.1:8545 --broadcast

All three env vars are required. The controller deploys with immutable
dependencies: compliance policy, dUSD token, ReserveVault.

After deploy, two wiring transactions are still required:

1. `dUSD` admin grants `MINTER_ROLE` to the controller:
   `cast send <DUSD_ADDRESS> "grantRole(bytes32,address)" $(cast keccak "MINTER_ROLE") <CONTROLLER_ADDRESS> ...`
2. Vault owner sets the controller:
   `cast send <VAULT_ADDRESS> "setController(address)" <CONTROLLER_ADDRESS> ...`

The controller holds no funds and has no admin role. Scaling is fixed at `1e12`:
1 mUSDC (1e6) mints 1 dUSD (1e18). A redeem amount that is not a multiple of
`1e12` reverts with `NotMultipleOfScale`, so no silent dust is created.

Compliance is checked before every mint and redeem. A blocked address cannot
mint or redeem, even if it is allowlisted.

### Where compliance is enforced (after module 5)

| Path | Enforced |
|---|---|
| Mint dUSD | controller checks `isAllowed` |
| Redeem dUSD | controller checks `isAllowed` |
| Transfer dUSD | token checks `isAllowed` on sender and recipient |
| Policy changes | `COMPLIANCE_ROLE` on the policy contract |

### Approval model

| Step | User approves | Why |
|---|---|---|
| Mint | the **vault** for mUSDC | `depositFor` pulls directly; the controller never holds collateral |
| Redeem | the **controller** for dUSD | `burnFrom` consumes an allowance; the controller only burns consented amounts |

## Deploy TokenFaucet

    MUSDC_ADDRESS=<MUSDC_ADDRESS> \
    COMPLIANCE_ADDRESS=<COMPLIANCE_ADDRESS> \
    FAUCET_AMOUNT=<AMOUNT_PER_CLAIM> \
    FAUCET_COOLDOWN=<SECONDS> \
    FAUCET_CAP=<LIFETIME_CAP> \
    forge script script/DeployTokenFaucet.s.sol:DeployTokenFaucet \
      --rpc-url http://127.0.0.1:8545 --broadcast

All five env vars are required. Demo values: `FAUCET_AMOUNT=100000000`
(100 mUSDC), `FAUCET_COOLDOWN=86400` (one day), `FAUCET_CAP=500000000`
(500 mUSDC).

After deploy, one wiring transaction is required: the current mUSDC owner must
hand ownership to the faucet, because only the owner may mint:

    cast send <MUSDC_ADDRESS> "transferOwnership(address)" <FAUCET_ADDRESS> ...

Until that transaction lands, every claim reverts with
`OwnableUnauthorizedAccount`.

The faucet mints mUSDC, never dUSD. It holds no funds and has no admin role and
no pause: all five settings are immutable, so changing the demo economics means
redeploying the faucet.

### Faucet rules

| Setting | Meaning |
|---|---|
| `AMOUNT` | mUSDC per claim, 6-decimal base units |
| `COOLDOWN` | minimum seconds between claims by one address |
| `CAP` | lifetime maximum per address, rounded down to whole claims |

Compliance is checked first on every claim, before the cooldown and before the
mint, so a blocked address cannot fund itself even if it never claimed before.

### Where compliance is enforced (after module 6)

| Path | Enforced |
|---|---|
| Claim demo mUSDC | faucet checks `isAllowed` |
| Mint dUSD | controller checks `isAllowed` |
| Redeem dUSD | controller checks `isAllowed` |
| Transfer dUSD | token checks `isAllowed` on sender and recipient |
| Policy changes | `COMPLIANCE_ROLE` on the policy contract |

## Deploy FixedPriceSource

    forge script script/DeployFixedPriceSource.s.sol:DeployFixedPriceSource \
      --rpc-url http://127.0.0.1:8545 --broadcast

No env vars and no constructor arguments. The source returns `1e18` for every
call: parity, 18-decimal fixed point.

This is a price **seam**, not a price feed. There is no oracle in v1 and the
contract does not pretend there is one. Nothing consumes it yet: the controller
enforces the 1:1 peg with its fixed `1e12` scaling, not with a price lookup.

The interface is one function:

    function price() external view returns (uint256);

Every implementation returns 18-decimal fixed point. `1e18` means parity, `2e18`
means one collateral unit is worth two dUSD, `5e17` means half. A future oracle
adapter normalises its feed to 18 decimals inside `price()`, so the call site does
not change.

### Where price is enforced (after module 7)

| Path | Enforced |
|---|---|
| Mint dUSD | fixed `1e12` scaling in the controller; no price call |
| Redeem dUSD | fixed `1e12` scaling in the controller; no price call |
| Price lookup | seam exists, no consumer yet |
| Oracle | none in v1; a real feed is a separate, tested change |

There is no admin, no setter and no storage in `FixedPriceSource`, so there is
nothing to manipulate and nothing to pause.

## Layout

- `src/` contracts
- `test/unit/` unit and fuzz tests
- `test/invariant/` reserve and supply invariants, plus the handler that drives them
- `script/` deployment scripts
- `lib/` dependencies (git submodules)
