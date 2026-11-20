// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/IERC6093.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";
import { ReserveVault } from "../../src/ReserveVault.sol";

contract ReserveVaultTest is Test {
    MockUSDC private usdc;
    ReserveVault private vault;

    address private owner;
    address private controller;
    address private alice;
    address private bob;

    uint256 private constant ONE_USDC = 1e6;

    event ControllerUpdated(address indexed previousController, address indexed newController);
    event Deposited(address indexed account, uint256 amount);
    event Released(address indexed account, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        controller = makeAddr("controller");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        usdc = new MockUSDC(owner);
        vault = new ReserveVault(usdc, owner);

        vm.prank(owner);
        vault.setController(controller);

        vm.prank(owner);
        usdc.mint(alice, 1_000 * ONE_USDC);

        vm.prank(alice);
        usdc.approve(address(vault), type(uint256).max);
    }

    function test_CollateralIsImmutableReference() public view {
        assertEq(address(vault.collateral()), address(usdc));
        assertEq(vault.owner(), owner);
        assertEq(vault.controller(), controller);
        assertEq(vault.totalDeposits(), 0);
        assertEq(vault.totalAssets(), 0);
    }

    function test_RevertWhen_CollateralIsZero() public {
        vm.expectRevert(ReserveVault.ZeroAddress.selector);
        new ReserveVault(MockUSDC(address(0)), owner);
    }

    function test_ControllerStartsUnset() public {
        ReserveVault fresh = new ReserveVault(usdc, owner);
        assertEq(fresh.controller(), address(0));
    }

    function test_OwnerCanSetController() public {
        ReserveVault fresh = new ReserveVault(usdc, owner);

        vm.expectEmit(true, true, false, true, address(fresh));
        emit ControllerUpdated(address(0), controller);

        vm.prank(owner);
        fresh.setController(controller);

        assertEq(fresh.controller(), controller);
    }

    function test_RevertWhen_NonOwnerSetsController() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        vm.prank(bob);
        vault.setController(bob);
    }

    function test_RevertWhen_ControllerIsZero() public {
        vm.expectRevert(ReserveVault.ZeroAddress.selector);
        vm.prank(owner);
        vault.setController(address(0));
    }

    function test_DepositForPullsCollateralAndCredits() public {
        vm.expectEmit(true, false, false, true, address(vault));
        emit Deposited(alice, 100 * ONE_USDC);

        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);

        assertEq(usdc.balanceOf(alice), 900 * ONE_USDC);
        assertEq(usdc.balanceOf(address(vault)), 100 * ONE_USDC);
        assertEq(vault.deposits(alice), 100 * ONE_USDC);
        assertEq(vault.totalDeposits(), 100 * ONE_USDC);
        assertEq(vault.totalAssets(), 100 * ONE_USDC);
    }

    function test_RevertWhen_NotControllerDeposits() public {
        vm.expectRevert(abi.encodeWithSelector(ReserveVault.NotController.selector, bob));
        vm.prank(bob);
        vault.depositFor(alice, 100 * ONE_USDC);
    }

    function test_RevertWhen_DepositIsZero() public {
        vm.expectRevert(ReserveVault.ZeroAmount.selector);
        vm.prank(controller);
        vault.depositFor(alice, 0);
    }

    function test_RevertWhen_DepositToZeroAddress() public {
        vm.expectRevert(ReserveVault.ZeroAddress.selector);
        vm.prank(controller);
        vault.depositFor(address(0), 100 * ONE_USDC);
    }

    function test_RevertWhen_DepositWithoutApproval() public {
        vm.prank(alice);
        usdc.approve(address(vault), 0);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector, address(vault), 0, 100 * ONE_USDC
            )
        );
        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);
    }

    function test_ReleaseToReturnsCollateral() public {
        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);

        vm.expectEmit(true, false, false, true, address(vault));
        emit Released(alice, 40 * ONE_USDC);

        vm.prank(controller);
        vault.releaseTo(alice, 40 * ONE_USDC);

        assertEq(usdc.balanceOf(alice), 940 * ONE_USDC);
        assertEq(usdc.balanceOf(address(vault)), 60 * ONE_USDC);
        assertEq(vault.deposits(alice), 60 * ONE_USDC);
        assertEq(vault.totalDeposits(), 60 * ONE_USDC);
        assertEq(vault.totalAssets(), 60 * ONE_USDC);
    }

    function test_RevertWhen_ReleaseExceedsDeposit() public {
        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);

        vm.expectRevert(
            abi.encodeWithSelector(
                ReserveVault.InsufficientDeposit.selector, alice, 100 * ONE_USDC, 101 * ONE_USDC
            )
        );
        vm.prank(controller);
        vault.releaseTo(alice, 101 * ONE_USDC);
    }

    function test_RevertWhen_NotControllerReleases() public {
        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);

        vm.expectRevert(abi.encodeWithSelector(ReserveVault.NotController.selector, alice));
        vm.prank(alice);
        vault.releaseTo(alice, 100 * ONE_USDC);
    }

    function test_RevertWhen_ReleaseIsZero() public {
        vm.prank(controller);
        vault.depositFor(alice, 100 * ONE_USDC);

        vm.expectRevert(ReserveVault.ZeroAmount.selector);
        vm.prank(controller);
        vault.releaseTo(alice, 0);
    }

    function test_DirectDonationShowsAsSurplus() public {
        vm.prank(owner);
        usdc.mint(address(vault), 5 * ONE_USDC);

        assertEq(vault.totalAssets(), 5 * ONE_USDC);
        assertEq(vault.totalDeposits(), 0);
        assertEq(vault.surplus(), 5 * ONE_USDC);
    }

    function testFuzz_DepositThenReleaseIsNeutral(uint96 amount) public {
        amount = uint96(bound(uint256(amount), 1, 1_000 * ONE_USDC));

        vm.prank(controller);
        vault.depositFor(alice, amount);
        assertEq(vault.totalDeposits(), uint256(amount));

        vm.prank(controller);
        vault.releaseTo(alice, amount);

        assertEq(vault.deposits(alice), 0);
        assertEq(vault.totalDeposits(), 0);
        assertEq(vault.totalAssets(), 0);
        assertEq(usdc.balanceOf(alice), 1_000 * ONE_USDC);
    }
}
