// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";
import { ReserveVault } from "../../src/ReserveVault.sol";
import { dUSD } from "../../src/dUSD.sol";
import { MintRedeemController } from "../../src/MintRedeemController.sol";
import { TokenFaucet } from "../../src/TokenFaucet.sol";
import { ReserveHandler } from "./ReserveHandler.sol";

/// @title ReserveInvariantTest
/// @notice Fuzzes random sequences of claim, mint, redeem, donate, transfer and
///         time-warp against the real contracts, then checks the reserve ledger.
/// @dev The suite answers one question the unit tests cannot: does the backing
///      property survive every legal ordering of operations, not just the ones a
///      human thought to write down. The handler is the only target, so every call
///      the fuzzer makes is a real user action.
contract ReserveInvariantTest is Test {
    uint256 private constant SCALE = 1e12;

    MockUSDC private musdc;
    CompliancePolicy private policy;
    ReserveVault private vault;
    dUSD private dusd;
    MintRedeemController private controller;
    TokenFaucet private faucet;
    ReserveHandler private handler;

    /// @dev Builds the full system once per run and wires it exactly as the deploy
    ///      script does: faucet owns mUSDC, controller owns the minter role, vault
    ///      points at the controller. The handler is the only fuzz target.
    function setUp() public {
        musdc = new MockUSDC(address(this));
        policy = new CompliancePolicy(address(this));
        vault = new ReserveVault(musdc, address(this));
        dusd = new dUSD(address(this), policy);
        controller = new MintRedeemController(policy, dusd, vault);
        faucet = new TokenFaucet(policy, musdc, 100e6, 1 days, 500e6);

        musdc.transferOwnership(address(faucet));
        vault.setController(address(controller));
        dusd.grantRole(dusd.MINTER_ROLE(), address(controller));

        handler = new ReserveHandler(musdc, policy, vault, dusd, controller, faucet);

        targetContract(address(handler));
    }

    /// @notice Every dUSD must be backed by collateral the vault actually holds.
    /// @dev This is the headline property of a fiat-backed stablecoin: supply can
    ///      never outrun reserves, even after donations, redemptions and transfers.
    function invariant_SupplyNeverExceedsReserves() public view {
        assertLe(dusd.totalSupply(), vault.totalAssets() * SCALE);
    }

    /// @notice Supply must equal the collateral the vault has credited to users.
    /// @dev Donations raise assets but never create dUSD, so this equality is
    ///      stronger than the reserve inequality and catches a mint that skipped a
    ///      deposit or a release that failed to burn.
    function invariant_SupplyEqualsRecordedDeposits() public view {
        assertEq(dusd.totalSupply(), vault.totalDeposits() * SCALE);
    }

    /// @notice The vault must always hold at least what it owes its depositors.
    /// @dev `totalAssets` reads the token balance, so a failed release or a theft
    ///      from the vault would break this before it broke supply accounting.
    function invariant_VaultCoversDeposits() public view {
        assertGe(vault.totalAssets(), vault.totalDeposits());
    }

    /// @notice The per-account ledger must add up to the vault's total.
    /// @dev Sums every actor the handler can touch. A deposit credited to the wrong
    ///      key would leave totalDeposits correct but the ledger wrong, or vice
    ///      versa; this invariant compares the two views.
    function invariant_LedgerSumMatchesTotalDeposits() public view {
        uint256 sum;
        uint256 count = handler.actorCount();

        for (uint256 i = 0; i < count; ++i) {
            sum += vault.deposits(handler.actors(i));
        }

        assertEq(sum, vault.totalDeposits());
    }

    /// @notice Supply must be a whole number of dUSD, with no 6-decimal dust.
    /// @dev The controller enforces the 1e12 multiple on redeem; this proves the
    ///      property across every path, including faucet-funded mints. Dust supply
    ///      would make the reserve equality impossible to state cleanly.
    function invariant_SupplyIsWholeDusd() public view {
        assertEq(dusd.totalSupply() % SCALE, 0);
    }
}
