// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";
import { dUSD } from "../../src/dUSD.sol";

/// @title dUSDComplianceTest
/// @notice Behavioural spec for the transfer hook: who may move dUSD, and which
///         check wins when two rules would both revert.
/// @dev Every test carries a dev note stating what it proves. Read those notes
///      alone and you have the transfer policy's contract with its users: a block
///      stops both sides of a transfer, an allowlist gates receipts too, and an
///      unblock restores movement without a redeploy.
contract dUSDComplianceTest is Test {
    dUSD private token;
    CompliancePolicy private policy;

    address private admin;
    address private minter;
    address private pauser;
    address private alice;
    address private bob;
    address private carol;

    uint256 private constant ONE_DUSD = 1e18;

    /// @dev Builds one fresh world per test with the policy and token wired
    ///      together. Alice starts funded so every transfer test has a sender with
    ///      something to move.
    function setUp() public {
        admin = makeAddr("admin");
        minter = makeAddr("minter");
        pauser = makeAddr("pauser");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");

        policy = new CompliancePolicy(admin);
        token = new dUSD(admin, policy);

        vm.startPrank(admin);
        token.grantRole(token.MINTER_ROLE(), minter);
        token.grantRole(token.PAUSER_ROLE(), pauser);
        vm.stopPrank();

        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Happy path and single-sided blocks
    // ---------------------------------------------------------------------

    /// @dev Proves the hook does not break ordinary movement between two allowed
    ///      addresses. A hook that blocks everyone is a broken token, not a policy.
    function test_AllowedTransferSucceeds() public {
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        assertTrue(token.transfer(bob, 30 * ONE_DUSD));

        assertEq(token.balanceOf(alice), 70 * ONE_DUSD);
        assertEq(token.balanceOf(bob), 30 * ONE_DUSD);
    }

    /// @dev Proves a blocked sender cannot move tokens it already holds. This is the
    ///      exit test from A2: a block must stop the funds leaving, not only stop new
    ///      business.
    function test_RevertWhen_SenderBlocked() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, bob));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves a blocked recipient cannot receive tokens. Without this side a
    ///      blocked address could still accumulate balance and redeem later.
    function test_RevertWhen_RecipientBlocked() public {
        vm.prank(admin);
        policy.setBlocked(bob, true);

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, bob));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves the error names both addresses when both sides are blocked, so an
    ///      operator reading the revert can see the whole failure instead of half.
    function test_RevertWhen_BothBlockedNamesBoth() public {
        vm.startPrank(admin);
        policy.setBlocked(alice, true);
        policy.setBlocked(bob, true);
        vm.stopPrank();

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, bob));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves the zero-address exemption on mint. Minting is already gated by
    ///      MINTER_ROLE and the controller checks the account first, and the zero
    ///      address can never pass a policy; without the exemption every mint would
    ///      revert and supply could never exist.
    function test_MintSkipsHookForZeroAddress() public {
        vm.prank(admin);
        policy.setBlocked(carol, true);

        vm.prank(minter);
        token.mint(carol, 5 * ONE_DUSD);

        assertEq(token.balanceOf(carol), 5 * ONE_DUSD);
    }

    /// @dev Proves the zero-address exemption on burn. A blocked holder can destroy
    ///      its own tokens, which only reduces supply; it cannot move them to anyone
    ///      else while blocked.
    function test_BurnSkipsHookForZeroAddress() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.prank(alice);
        token.burn(10 * ONE_DUSD);

        assertEq(token.balanceOf(alice), 90 * ONE_DUSD);
        assertEq(token.totalSupply(), 90 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Allowlist mode and ordering
    // ---------------------------------------------------------------------

    /// @dev Proves allowlist mode gates the recipient as well as the sender. Turning
    ///      the allowlist on must not leave a receive-only path for unlisted wallets.
    function test_RevertWhen_AllowlistModeBlocksRecipient() public {
        vm.startPrank(admin);
        policy.setAllowlisted(alice, true);
        policy.setAllowlistEnabled(true);
        vm.stopPrank();

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, bob));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves unblocking restores movement without a redeploy. A block is a
    ///      policy decision, not a permanent property of the address.
    function test_UnblockRestoresTransfer() public {
        vm.startPrank(admin);
        policy.setBlocked(alice, true);
        policy.setBlocked(alice, false);
        vm.stopPrank();

        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);

        assertEq(token.balanceOf(bob), 1 * ONE_DUSD);
    }

    /// @dev Proves which error wins when the token is paused and the sender is
    ///      blocked: compliance runs first, so the revert names the blocked address
    ///      rather than a generic pause. Pinning the order keeps future refactors
    ///      from silently changing the diagnostics an operator sees.
    function test_ComplianceErrorWinsOverPause() public {
        vm.startPrank(admin);
        policy.setBlocked(alice, true);
        vm.stopPrank();

        vm.prank(pauser);
        token.pause();

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, bob));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Fuzz
    // ---------------------------------------------------------------------

    /// @dev Proves a blocked sender can never transfer to any address, for any
    ///      amount. A single hand-picked recipient would not catch an allow path
    ///      added for one special address.
    function testFuzz_BlockedSenderCannotTransfer(address to, uint96 amount) public {
        vm.assume(to != address(0));
        amount = uint96(bound(uint256(amount), 1, 100 * ONE_DUSD));

        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, alice, to));
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(to, amount);
    }

    /// @dev Proves a blocked recipient can never receive from any allowed address.
    ///      The sender is funded by the minter, so the only reason the transfer can
    ///      fail is the recipient's block.
    function testFuzz_BlockedRecipientCannotReceive(address from, uint96 amount) public {
        vm.assume(from != address(0) && from != address(token) && from != bob);
        amount = uint96(bound(uint256(amount), 1, 100 * ONE_DUSD));

        vm.prank(minter);
        token.mint(from, amount);

        vm.prank(admin);
        policy.setBlocked(bob, true);

        vm.expectRevert(abi.encodeWithSelector(dUSD.TransferNotCompliant.selector, from, bob));
        vm.prank(from);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, amount);
    }
}
