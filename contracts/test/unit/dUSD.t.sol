// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/IERC6093.sol";
import { dUSD } from "../../src/dUSD.sol";

/// @title dUSDTest
/// @notice Behavioural spec for the dUSD token: metadata, roles, mint, burn, pause.
/// @dev Every test carries a dev-note line that says what it proves and why that
///      property matters. Read those dev notes alone and you have the token's
///      contract with its users. The assertions are the proof; the comments explain
///      the intent so a failing test is diagnosable months later.
contract dUSDTest is Test {
    dUSD private token;

    address private admin;
    address private minter;
    address private pauser;
    address private alice;
    address private bob;

    /// @dev 1 dUSD in 18-decimal base units. Named so every amount in this file is
    ///      readable and a missing `* ONE_DUSD` is visible at a glance.
    uint256 private constant ONE_DUSD = 1e18;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Paused(address account);
    event Unpaused(address account);

    /// @dev Builds one fresh world per test: five labelled actors, one token, and
    ///      the two operational roles split away from the admin. Splitting the roles
    ///      here is what lets the negative tests prove the gates actually exist.
    function setUp() public {
        admin = makeAddr("admin");
        minter = makeAddr("minter");
        pauser = makeAddr("pauser");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token = new dUSD(admin);

        vm.startPrank(admin);
        token.grantRole(token.MINTER_ROLE(), minter);
        token.grantRole(token.PAUSER_ROLE(), pauser);
        vm.stopPrank();
    }

    // ---------------------------------------------------------------------
    // Metadata and roles
    // ---------------------------------------------------------------------

    /// @dev Proves the token identifies itself exactly as designed: 18 decimals
    ///      (ERC-20 default, no override), fixed name and symbol, zero supply at
    ///      deploy. A wrong decimal count silently misprices every integration.
    function test_MetadataIsStandard() public view {
        assertEq(token.name(), "dUSD Stablecoin");
        assertEq(token.symbol(), "dUSD");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
    }

    /// @dev Proves the role identifiers are the documented strings. Off-chain
    ///      tooling and the deploy script grant roles by hash; a renamed string
    ///      would silently produce a role nobody holds.
    function test_RoleConstantsMatchDocumentedNames() public view {
        assertEq(token.MINTER_ROLE(), keccak256("MINTER_ROLE"));
        assertEq(token.PAUSER_ROLE(), keccak256("PAUSER_ROLE"));
    }

    /// @dev Proves the deployer receives admin, minter and pauser rights. Without
    ///      the admin role no one could ever grant roles, and the token would be
    ///      frozen with zero supply forever.
    function test_ConstructorGrantsAllRolesToAdmin() public view {
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(token.hasRole(token.MINTER_ROLE(), admin));
        assertTrue(token.hasRole(token.PAUSER_ROLE(), admin));
    }

    /// @dev Proves a zero admin is rejected. Roles held by address(0) can never be
    ///      exercised or transferred, which would brick role administration.
    function test_RevertWhen_AdminIsZero() public {
        vm.expectRevert(dUSD.ZeroAddress.selector);
        new dUSD(address(0));
    }

    // ---------------------------------------------------------------------
    // Minting
    // ---------------------------------------------------------------------

    /// @dev Proves the only supply-creation path credits the recipient, raises
    ///      totalSupply by exactly the amount, and emits Transfer from address(0),
    ///      which is how indexers reconstruct supply.
    function test_MinterCanMint() public {
        vm.expectEmit(true, true, false, true, address(token));
        emit Transfer(address(0), alice, 100 * ONE_DUSD);

        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        assertEq(token.balanceOf(alice), 100 * ONE_DUSD);
        assertEq(token.totalSupply(), 100 * ONE_DUSD);
    }

    /// @dev Proves a stranger cannot create supply. An unguarded mint is unlimited
    ///      inflation and the fastest way to break the 1:1 backing promise.
    function test_RevertWhen_NonMinterMints() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, bob, token.MINTER_ROLE()
            )
        );
        vm.prank(bob);
        token.mint(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves minting to the zero address is rejected. Those tokens could never
    ///      be moved or burned, so supply would exist with no owner.
    function test_RevertWhen_MintToZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0))
        );
        vm.prank(minter);
        token.mint(address(0), 1 * ONE_DUSD);
    }

    /// @dev Proves a zero mint is rejected. It would emit a Transfer event and cost
    ///      gas while changing nothing, which pollutes the audit trail.
    function test_RevertWhen_MintIsZero() public {
        vm.expectRevert(dUSD.ZeroAmount.selector);
        vm.prank(minter);
        token.mint(alice, 0);
    }

    // ---------------------------------------------------------------------
    // Burning and redemption pattern
    // ---------------------------------------------------------------------

    /// @dev Proves a holder can destroy their own tokens and that supply falls with
    ///      the balance. This is the user-side escape hatch that needs no permission.
    function test_HolderCanBurnOwnTokens() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.prank(alice);
        token.burn(40 * ONE_DUSD);

        assertEq(token.balanceOf(alice), 60 * ONE_DUSD);
        assertEq(token.totalSupply(), 60 * ONE_DUSD);
    }

    /// @dev Proves the exact pattern module 5 will use: the holder approves the
    ///      controller, the controller burns with `burnFrom`, and the allowance is
    ///      spent. Consent is the allowance, so no key can burn a user's balance.
    function test_BurnFromSpendsAllowance() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.prank(alice);
        token.approve(bob, 100 * ONE_DUSD);

        vm.prank(bob);
        token.burnFrom(alice, 100 * ONE_DUSD);

        assertEq(token.balanceOf(alice), 0);
        assertEq(token.allowance(alice, bob), 0);
        assertEq(token.totalSupply(), 0);
    }

    /// @dev Proves `burnFrom` without an allowance reverts. Without this check any
    ///      address could destroy any balance, which is the worst failure mode a
    ///      stablecoin can have.
    function test_RevertWhen_BurnFromWithoutAllowance() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector, bob, 0, 100 * ONE_DUSD
            )
        );
        vm.prank(bob);
        token.burnFrom(alice, 100 * ONE_DUSD);
    }

    /// @dev Proves a holder cannot burn more than they hold. The balance check is
    ///      what keeps totalSupply from underflowing into a nonsense number.
    function test_RevertWhen_BurnExceedsBalance() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                alice,
                100 * ONE_DUSD,
                101 * ONE_DUSD
            )
        );
        vm.prank(alice);
        token.burn(101 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Transfers
    // ---------------------------------------------------------------------

    /// @dev Proves plain ERC-20 movement works and does not change supply. A smoke
    ///      test, but it catches a broken `_update` override immediately.
    function test_TransferMovesTokens() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.prank(alice);
        assertTrue(token.transfer(bob, 30 * ONE_DUSD));

        assertEq(token.balanceOf(alice), 70 * ONE_DUSD);
        assertEq(token.balanceOf(bob), 30 * ONE_DUSD);
        assertEq(token.totalSupply(), 100 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Pause
    // ---------------------------------------------------------------------

    /// @dev Proves the pauser can stop and resume movement, and that both state
    ///      changes are announced in the log. Indexers and the frontend watch these
    ///      events to disable the UI during an incident.
    function test_PauserCanPauseAndUnpause() public {
        vm.expectEmit(false, false, false, true, address(token));
        emit Paused(pauser);
        vm.prank(pauser);
        token.pause();
        assertTrue(token.paused());

        vm.expectEmit(false, false, false, true, address(token));
        emit Unpaused(pauser);
        vm.prank(pauser);
        token.unpause();
        assertFalse(token.paused());
    }

    /// @dev Proves pausing is itself gated. An open pause function lets anyone
    ///      freeze every holder's funds, a cheap denial of service.
    function test_RevertWhen_NonPauserPauses() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, bob, token.PAUSER_ROLE()
            )
        );
        vm.prank(bob);
        token.pause();
    }

    /// @dev Proves transfers stop while paused. This is the emergency brake's whole
    ///      purpose: freeze movement before an exploit drains balances.
    function test_RevertWhen_TransferWhilePaused() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.prank(pauser);
        token.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(alice);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(bob, 1 * ONE_DUSD);
    }

    /// @dev Proves a pause also stops minting, because ERC20Pausable guards every
    ///      `_update`. Supply cannot grow while the system is frozen.
    function test_RevertWhen_MintWhilePaused() public {
        vm.prank(pauser);
        token.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(minter);
        token.mint(alice, 1 * ONE_DUSD);
    }

    /// @dev Proves a pause also stops burning, so redemption is blocked while
    ///      paused. This is the honest cost of the standard OpenZeppelin guard, and
    ///      the reason a pause must be short and deliberate.
    function test_RevertWhen_BurnWhilePaused() public {
        vm.prank(minter);
        token.mint(alice, 100 * ONE_DUSD);

        vm.prank(pauser);
        token.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(alice);
        token.burn(1 * ONE_DUSD);
    }

    // ---------------------------------------------------------------------
    // Fuzz
    // ---------------------------------------------------------------------

    /// @dev Proves minting then burning the same amount is exactly neutral for any
    ///      amount in the interesting range. Catches rounding, drift and off-by-one
    ///      errors that three hand-picked amounts would miss.
    function testFuzz_MintThenBurnIsNeutral(uint96 amount) public {
        amount = uint96(bound(uint256(amount), 1, 1_000_000 * ONE_DUSD));

        vm.prank(minter);
        token.mint(alice, amount);
        assertEq(token.totalSupply(), uint256(amount));

        vm.prank(alice);
        token.burn(amount);

        assertEq(token.balanceOf(alice), 0);
        assertEq(token.totalSupply(), 0);
    }

    /// @dev Proves totalSupply equals exactly what was minted for any recipient and
    ///      any amount. Supply is the denominator of the reserve ratio, so an
    ///      off-by-one here would misstate backing for every holder.
    function testFuzz_MintIncreasesSupplyExactly(address to, uint96 amount) public {
        vm.assume(to != address(0));
        amount = uint96(bound(uint256(amount), 1, 1_000_000 * ONE_DUSD));

        vm.prank(minter);
        token.mint(to, amount);

        assertEq(token.totalSupply(), uint256(amount));
        assertEq(token.balanceOf(to), uint256(amount));
    }
}
