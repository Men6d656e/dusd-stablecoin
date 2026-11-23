// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";
import { ReserveVault } from "../../src/ReserveVault.sol";
import { dUSD } from "../../src/dUSD.sol";
import { MintRedeemController } from "../../src/MintRedeemController.sol";
import { TokenFaucet } from "../../src/TokenFaucet.sol";

/// @title ReserveHandler
/// @notice Drives the real dUSD contracts through the four user actions the system
///         supports, so the invariant suite fuzzes behaviour instead of state.
/// @dev Every action picks one of three fixed actors and bounds its amount to what
///      that actor can actually do. Failures are swallowed with `try/catch`: the
///      handler explores successful paths, while the invariants check the result.
///      Direct donations to the vault are included on purpose; they are the reason
///      `totalAssets` can exceed `totalDeposits`.
contract ReserveHandler is Test {
    /// @notice mUSDC minted per faucet claim, in 6-decimal base units.
    uint256 public constant CLAIM_AMOUNT = 100e6;

    /// @dev Collateral base units to dUSD base units.
    uint256 public constant SCALE = 1e12;

    MockUSDC public immutable MUSDC;
    CompliancePolicy public immutable POLICY;
    ReserveVault public immutable VAULT;
    dUSD public immutable DUSD;
    MintRedeemController public immutable CONTROLLER;
    TokenFaucet public immutable FAUCET;

    /// @notice The three accounts the fuzzer acts as.
    address[] public actors;

    /// @notice Creates the handler and the fixed actor set.
    /// @param musdc_ Collateral token.
    /// @param policy_ Compliance policy shared by token, controller and faucet.
    /// @param vault_ Collateral custody ledger.
    /// @param dusd_ Token minted and burned by the controller.
    /// @param controller_ The only money path.
    /// @param faucet_ Demo collateral source.
    constructor(
        MockUSDC musdc_,
        CompliancePolicy policy_,
        ReserveVault vault_,
        dUSD dusd_,
        MintRedeemController controller_,
        TokenFaucet faucet_
    ) {
        MUSDC = musdc_;
        POLICY = policy_;
        VAULT = vault_;
        DUSD = dusd_;
        CONTROLLER = controller_;
        FAUCET = faucet_;

        actors.push(makeAddr("alice"));
        actors.push(makeAddr("bob"));
        actors.push(makeAddr("carol"));
    }

    /// @notice Claims faucet mUSDC for one actor.
    /// @dev `warp` between actions is what makes the cooldown reachable; without it
    ///      every actor could claim only once.
    function claim(uint256 actorSeed) external {
        address actor = _actor(actorSeed);

        vm.prank(actor);
        try FAUCET.claim() { } catch { }
    }

    /// @notice Deposits collateral and mints dUSD for one actor.
    /// @dev Approves the vault, not the controller, mirroring the real flow. The
    ///      amount is bounded to the actor's actual balance so most calls reach the
    ///      money path instead of reverting for lack of funds.
    function mint(uint256 actorSeed, uint256 amount) external {
        address actor = _actor(actorSeed);
        uint256 balance = MUSDC.balanceOf(actor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);

        vm.startPrank(actor);
        MUSDC.approve(address(VAULT), amount);
        try CONTROLLER.mint(amount) { } catch { }
        vm.stopPrank();
    }

    /// @notice Burns dUSD and releases collateral for one actor.
    /// @dev Rounds down to whole dUSD because the controller rejects dust. The
    ///      approval is exact, so a failed redeem cannot leave a standing allowance.
    function redeem(uint256 actorSeed, uint256 amount) external {
        address actor = _actor(actorSeed);
        uint256 balance = DUSD.balanceOf(actor);
        uint256 wholeUnits = balance / SCALE;
        if (wholeUnits == 0) return;

        amount = bound(amount, 1, wholeUnits) * SCALE;

        vm.startPrank(actor);
        DUSD.approve(address(CONTROLLER), amount);
        try CONTROLLER.redeem(amount) { } catch { }
        vm.stopPrank();
    }

    /// @notice Sends mUSDC straight to the vault, outside the deposit ledger.
    /// @dev This is the donation path: it raises `totalAssets` without raising
    ///      `totalDeposits`, which is why the supply-to-assets invariant is an
    ///      inequality while supply-to-deposits is an equality.
    function donate(uint256 actorSeed, uint256 amount) external {
        address actor = _actor(actorSeed);
        uint256 balance = MUSDC.balanceOf(actor);
        if (balance == 0) return;

        amount = bound(amount, 1, balance);

        vm.prank(actor);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        MUSDC.transfer(address(VAULT), amount);
    }

    /// @notice Moves dUSD between two actors, exercising the transfer hook.
    /// @dev Transfers never change supply or reserves, so the invariants must hold
    ///      across them too; this action is what proves the hook is not bypassable
    ///      by ordinary movement.
    function transfer(uint256 fromSeed, uint256 toSeed, uint256 amount) external {
        address from = _actor(fromSeed);
        address to = _actor(toSeed);
        uint256 balance = DUSD.balanceOf(from);
        if (balance == 0 || from == to) return;

        amount = bound(amount, 1, balance);

        vm.prank(from);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        try DUSD.transfer(to, amount) { } catch { }
    }

    /// @notice Advances time so cooldowns expire and timestamps are not constant.
    function warp(uint256 secondsForward) external {
        vm.warp(block.timestamp + bound(secondsForward, 1, 2 days));
    }

    /// @notice Number of actors the handler drives.
    /// @return count Always three.
    function actorCount() external view returns (uint256 count) {
        return actors.length;
    }

    /// @dev Maps a fuzzed seed onto one of the fixed actors.
    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }
}
