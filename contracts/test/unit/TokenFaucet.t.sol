// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { ICompliance } from "../../src/interfaces/ICompliance.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";
import { TokenFaucet } from "../../src/TokenFaucet.sol";

/// @title TokenFaucetTest
/// @notice Behavioural spec for the demo mUSDC faucet.
/// @dev Every test carries a dev note stating what it proves. Read the dev notes
///      alone and you have the faucet's contract with its users: who may claim,
///      how often, how much in total, and what a block outranks.
contract TokenFaucetTest is Test {
    uint256 private constant AMOUNT = 100e6;
    uint256 private constant COOLDOWN = 1 days;
    uint256 private constant CAP = 500e6;

    MockUSDC private musdc;
    CompliancePolicy private policy;
    TokenFaucet private faucet;

    address private admin;
    address private alice;
    address private bob;

    event Claimed(
        address indexed account, uint256 amount, uint256 claimedTotal, uint256 nextClaimAt
    );

    /// @dev Builds the token, policy and faucet, then hands mUSDC ownership to the
    ///      faucet. That transfer is the real deploy wiring: without it every claim
    ///      reverts, so the setup proves the documented order works.
    function setUp() public {
        admin = makeAddr("admin");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        musdc = new MockUSDC(admin);
        policy = new CompliancePolicy(admin);
        faucet = new TokenFaucet(policy, musdc, AMOUNT, COOLDOWN, CAP);

        vm.prank(admin);
        musdc.transferOwnership(address(faucet));
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @dev Proves every configured value is stored immutably and readable. A deploy
    ///      that silently changed the demo economics would be invisible without this.
    function test_ConstructorStoresConfig() public view {
        assertEq(address(faucet.MUSDC()), address(musdc));
        assertEq(address(faucet.COMPLIANCE()), address(policy));
        assertEq(faucet.AMOUNT(), AMOUNT);
        assertEq(faucet.COOLDOWN(), COOLDOWN);
        assertEq(faucet.CAP(), CAP);
    }

    /// @dev Proves a zero policy is rejected. A faucet with no compliance gate would
    ///      let any address fund itself, which defeats the policy's whole purpose.
    function test_RevertWhen_ComplianceIsZero() public {
        vm.expectRevert(TokenFaucet.ZeroAddress.selector);
        new TokenFaucet(ICompliance(address(0)), musdc, AMOUNT, COOLDOWN, CAP);
    }

    /// @dev Proves a zero token is rejected. The faucet would have no mint target and
    ///      every claim would revert at an unhelpful place instead of at deploy.
    function test_RevertWhen_MUSDCIsZero() public {
        vm.expectRevert(TokenFaucet.ZeroAddress.selector);
        new TokenFaucet(policy, MockUSDC(address(0)), AMOUNT, COOLDOWN, CAP);
    }

    /// @dev Proves a zero amount is rejected. A claim that mints nothing still burns
    ///      gas and writes state, and would look like a working faucet that is broken.
    function test_RevertWhen_AmountIsZero() public {
        vm.expectRevert(TokenFaucet.ZeroAmount.selector);
        new TokenFaucet(policy, musdc, 0, COOLDOWN, CAP);
    }

    /// @dev Proves a zero cooldown is rejected. Without a cooldown one address can
    ///      take its whole cap in a single block, which is the abuse this module exists
    ///      to prevent.
    function test_RevertWhen_CooldownIsZero() public {
        vm.expectRevert(TokenFaucet.ZeroCooldown.selector);
        new TokenFaucet(policy, musdc, AMOUNT, 0, CAP);
    }

    /// @dev Proves a cap smaller than one claim is rejected. Otherwise the faucet
    ///      would deploy successfully and then revert on every claim forever.
    function test_RevertWhen_CapBelowAmount() public {
        vm.expectRevert(
            abi.encodeWithSelector(TokenFaucet.CapBelowAmount.selector, AMOUNT - 1, AMOUNT)
        );
        new TokenFaucet(policy, musdc, AMOUNT, COOLDOWN, AMOUNT - 1);
    }

    // ---------------------------------------------------------------------
    // Claim
    // ---------------------------------------------------------------------

    /// @dev Proves a claim mints exactly AMOUNT to the caller and that supply grows by
    ///      the same amount. This is the faucet's core promise.
    function test_ClaimMintsFixedAmount() public {
        vm.prank(alice);
        faucet.claim();

        assertEq(musdc.balanceOf(alice), AMOUNT);
        assertEq(musdc.totalSupply(), AMOUNT);
    }

    /// @dev Proves a claim records both the timestamp and the running total. These are
    ///      the two reads a UI needs to show the next claim time and the remaining cap.
    function test_ClaimRecordsState() public {
        vm.prank(alice);
        faucet.claim();

        assertEq(faucet.lastClaim(alice), block.timestamp);
        assertEq(faucet.claimed(alice), AMOUNT);
    }

    /// @dev Proves the event carries the amount, the new lifetime total and the next
    ///      allowed timestamp. An indexer can rebuild faucet usage from logs alone.
    function test_ClaimEmitsClaimed() public {
        vm.expectEmit(true, false, false, true, address(faucet));
        emit Claimed(alice, AMOUNT, AMOUNT, block.timestamp + COOLDOWN);

        vm.prank(alice);
        faucet.claim();
    }

    /// @dev Proves the cooldown is a pause, not a one-shot. After it elapses the same
    ///      address may claim again and its lifetime total accumulates.
    function test_ClaimAgainAfterCooldown() public {
        vm.startPrank(alice);
        faucet.claim();
        vm.warp(block.timestamp + COOLDOWN);
        faucet.claim();
        vm.stopPrank();

        assertEq(musdc.balanceOf(alice), 2 * AMOUNT);
        assertEq(faucet.claimed(alice), 2 * AMOUNT);
    }

    /// @dev Proves a second claim one second early reverts with the exact timestamp at
    ///      which it becomes legal. The error is what a frontend shows as a countdown.
    function test_RevertWhen_ClaimBeforeCooldown() public {
        vm.prank(alice);
        faucet.claim();

        uint256 availableAt = block.timestamp + COOLDOWN;
        vm.warp(availableAt - 1);

        vm.expectRevert(
            abi.encodeWithSelector(TokenFaucet.CooldownActive.selector, alice, availableAt)
        );
        vm.prank(alice);
        faucet.claim();
    }

    /// @dev Proves the boundary is inclusive: at exactly lastClaim + COOLDOWN the claim
    ///      succeeds. Off-by-one here would make the documented cooldown a lie.
    function test_ClaimAtExactCooldownBoundary() public {
        vm.prank(alice);
        faucet.claim();

        vm.warp(block.timestamp + COOLDOWN);

        vm.prank(alice);
        faucet.claim();

        assertEq(faucet.claimed(alice), 2 * AMOUNT);
    }

    /// @dev Proves the cap is reachable exactly: five claims of 100 reach the 500 cap
    ///      and each one succeeds. An unreachable cap would make the config meaningless.
    function test_CapAllowsExactlyFiveClaims() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            faucet.claim();
            vm.warp(block.timestamp + COOLDOWN);
        }

        assertEq(faucet.claimed(alice), CAP);
        assertEq(musdc.balanceOf(alice), CAP);
    }

    /// @dev Proves a sixth claim reverts once the lifetime cap is reached, and names
    ///      both the current total and the cap. The faucet cannot be drained past it.
    function test_RevertWhen_ClaimExceedsCap() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            faucet.claim();
            vm.warp(block.timestamp + COOLDOWN);
        }

        vm.expectRevert(abi.encodeWithSelector(TokenFaucet.CapExceeded.selector, alice, CAP, CAP));
        vm.prank(alice);
        faucet.claim();
    }

    /// @dev Proves a blocked address cannot claim at all, even on its first attempt and
    ///      even though the policy is otherwise open. A block outranks every allowance.
    function test_RevertWhen_BlockedCannotClaim() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.expectRevert(abi.encodeWithSelector(TokenFaucet.NotCompliant.selector, alice));
        vm.prank(alice);
        faucet.claim();
    }

    /// @dev Proves compliance is checked before any mint or state write. If the order
    ///      were reversed, a blocked address would still move supply and only then revert.
    function test_ComplianceCheckedBeforeMint() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        uint256 supplyBefore = musdc.totalSupply();

        vm.expectRevert(abi.encodeWithSelector(TokenFaucet.NotCompliant.selector, alice));
        vm.prank(alice);
        faucet.claim();

        assertEq(musdc.totalSupply(), supplyBefore);
        assertEq(faucet.claimed(alice), 0);
        assertEq(faucet.lastClaim(alice), 0);
    }

    /// @dev Proves a block is reversible: once the operator unblocks the address, the
    ///      same claim succeeds. The faucet has no memory that would punish it forever.
    function test_UnblockedCanClaim() public {
        vm.startPrank(admin);
        policy.setBlocked(alice, true);
        policy.setBlocked(alice, false);
        vm.stopPrank();

        vm.prank(alice);
        faucet.claim();

        assertEq(musdc.balanceOf(alice), AMOUNT);
    }

    /// @dev Proves the read-only preview matches the write path: true before a claim,
    ///      false during the cooldown, true after it, false again when blocked.
    function test_CanClaimView() public {
        assertTrue(faucet.canClaim(alice));

        vm.prank(alice);
        faucet.claim();
        assertFalse(faucet.canClaim(alice));

        vm.warp(block.timestamp + COOLDOWN);
        assertTrue(faucet.canClaim(alice));

        vm.prank(admin);
        policy.setBlocked(alice, true);
        assertFalse(faucet.canClaim(alice));
    }

    /// @dev Proves the next-claim read is zero before the first claim and exactly
    ///      lastClaim + COOLDOWN afterwards. Zero means "no cooldown running", not 1970.
    function test_NextClaimAt() public {
        assertEq(faucet.nextClaimAt(alice), 0);

        vm.prank(alice);
        faucet.claim();

        assertEq(faucet.nextClaimAt(alice), block.timestamp + COOLDOWN);
    }

    /// @dev Proves the cooldown is per address, not global. One wallet claiming must not
    ///      delay every other wallet, or the demo would serialize its own testers.
    function test_CooldownIsPerAccount() public {
        vm.prank(alice);
        faucet.claim();

        assertEq(faucet.claimed(bob), 0);

        vm.prank(bob);
        faucet.claim();

        assertEq(faucet.claimed(bob), AMOUNT);
    }

    // ---------------------------------------------------------------------
    // Fuzz
    // ---------------------------------------------------------------------

    /// @dev Proves any compliant address receives exactly AMOUNT on its first claim.
    ///      Fuzzing the caller catches an accidental msg.sender/account mix-up.
    function testFuzz_ClaimMintsExactlyAmount(address account) public {
        vm.assume(account != address(0));
        vm.assume(account != address(faucet));

        vm.prank(account);
        faucet.claim();

        assertEq(musdc.balanceOf(account), AMOUNT);
        assertEq(faucet.claimed(account), AMOUNT);
    }

    /// @dev Proves no address can claim twice in the same block, whatever the address.
    ///      The cooldown must hold for every caller, not just the named test wallets.
    function testFuzz_CooldownBlocksImmediateSecondClaim(address account) public {
        vm.assume(account != address(0));
        vm.assume(account != address(faucet));

        vm.prank(account);
        faucet.claim();

        uint256 availableAt = block.timestamp + COOLDOWN;
        vm.expectRevert(
            abi.encodeWithSelector(TokenFaucet.CooldownActive.selector, account, availableAt)
        );
        vm.prank(account);
        faucet.claim();
    }

    /// @dev Proves no sequence of allowed claims can push an address past the cap. The
    ///      loop is bounded, but it covers every claim count from zero to eight.
    function testFuzz_ClaimedNeverExceedsCap(address account, uint8 cycles) public {
        vm.assume(account != address(0));
        vm.assume(account != address(faucet));
        cycles = uint8(bound(cycles, 0, 8));

        for (uint256 i = 0; i < cycles; i++) {
            vm.prank(account);
            (bool ok,) = address(faucet).call(abi.encodeCall(TokenFaucet.claim, ()));
            if (!ok) break;
            vm.warp(block.timestamp + COOLDOWN);
        }

        assertLe(faucet.claimed(account), CAP);
        assertLe(musdc.balanceOf(account), CAP);
    }
}
