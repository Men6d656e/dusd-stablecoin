// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";
import { ReserveVault } from "../../src/ReserveVault.sol";
import { dUSD } from "../../src/dUSD.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";
import { MintRedeemController } from "../../src/MintRedeemController.sol";

/// @title MintRedeemControllerTest
/// @notice Behavioural spec for the mint/redeem money path.
contract MintRedeemControllerTest is Test {
    uint256 private constant SCALE = 1e12;

    MockUSDC private musdc;
    ReserveVault private vault;
    dUSD private dusd;
    CompliancePolicy private policy;
    MintRedeemController private controller;

    address private admin;
    address private alice;
    address private bob;

    event Minted(address indexed account, uint256 collateralAmount, uint256 dusdAmount);
    event Redeemed(address indexed account, uint256 dusdAmount, uint256 collateralAmount);

    function setUp() public {
        admin = makeAddr("admin");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        musdc = new MockUSDC(admin);
        vault = new ReserveVault(musdc, admin);
        policy = new CompliancePolicy(admin);
        dusd = new dUSD(admin);

        controller = new MintRedeemController(policy, dusd, vault);

        vm.startPrank(admin);
        dusd.grantRole(dusd.MINTER_ROLE(), address(controller));
        vault.setController(address(controller));
        vm.stopPrank();

        // Fund alice with collateral.
        vm.prank(admin);
        musdc.mint(alice, 1_000e6);
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    function test_ConstructorStoresImmutables() public view {
        assertEq(address(controller.COMPLIANCE()), address(policy));
        assertEq(address(controller.DUSD()), address(dusd));
        assertEq(address(controller.VAULT()), address(vault));
        assertEq(controller.SCALE(), SCALE);
    }

    function test_RevertWhen_ComplianceIsZero() public {
        vm.expectRevert(MintRedeemController.ZeroAddress.selector);
        new MintRedeemController(CompliancePolicy(address(0)), dusd, vault);
    }

    function test_RevertWhen_DUSDIsZero() public {
        vm.expectRevert(MintRedeemController.ZeroAddress.selector);
        new MintRedeemController(policy, dUSD(address(0)), vault);
    }

    function test_RevertWhen_VaultIsZero() public {
        vm.expectRevert(MintRedeemController.ZeroAddress.selector);
        new MintRedeemController(policy, dusd, ReserveVault(address(0)));
    }

    // ---------------------------------------------------------------------
    // Mint
    // ---------------------------------------------------------------------

    function test_MintHappyPath() public {
        uint256 coll = 100e6;

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);

        vm.expectEmit(true, false, false, true, address(controller));
        emit Minted(alice, coll, coll * SCALE);

        controller.mint(coll);
        vm.stopPrank();

        assertEq(dusd.balanceOf(alice), coll * SCALE);
        assertEq(vault.deposits(alice), coll);
        assertEq(vault.totalDeposits(), coll);
        assertEq(musdc.balanceOf(address(vault)), coll);
    }

    function test_MintScalesOneToOne() public {
        uint256 coll = 1e6; // 1 mUSDC

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);
        controller.mint(coll);
        vm.stopPrank();

        assertEq(dusd.balanceOf(alice), 1e18);
    }

    function test_RevertWhen_MintZero() public {
        vm.expectRevert(MintRedeemController.ZeroAmount.selector);
        vm.prank(alice);
        controller.mint(0);
    }

    function test_RevertWhen_MintNotCompliant() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.expectRevert(abi.encodeWithSelector(MintRedeemController.NotCompliant.selector, alice));
        vm.prank(alice);
        controller.mint(10e6);
    }

    function test_RevertWhen_MintWithoutVaultApproval() public {
        vm.expectRevert(); // safeTransferFrom fails
        vm.prank(alice);
        controller.mint(10e6);
    }

    function test_MintChecksComplianceBeforeDeposit() public {
        vm.prank(admin);
        policy.setBlocked(alice, true);

        uint256 beforeAssets = vault.totalAssets();

        vm.expectRevert(abi.encodeWithSelector(MintRedeemController.NotCompliant.selector, alice));
        vm.prank(alice);
        controller.mint(10e6);

        assertEq(vault.totalAssets(), beforeAssets);
        assertEq(vault.deposits(alice), 0);
    }

    // ---------------------------------------------------------------------
    // Redeem
    // ---------------------------------------------------------------------

    function test_RedeemHappyPath() public {
        uint256 coll = 100e6;

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);
        controller.mint(coll);

        dusd.approve(address(controller), coll * SCALE);

        vm.expectEmit(true, false, false, true, address(controller));
        emit Redeemed(alice, coll * SCALE, coll);

        controller.redeem(coll * SCALE);
        vm.stopPrank();

        assertEq(dusd.balanceOf(alice), 0);
        assertEq(vault.deposits(alice), 0);
        assertEq(vault.totalDeposits(), 0);
        assertEq(musdc.balanceOf(alice), 1_000e6);
    }

    function test_RedeeemReleasesCollateral() public {
        uint256 coll = 50e6;

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);
        controller.mint(coll);
        dusd.approve(address(controller), coll * SCALE);
        controller.redeem(coll * SCALE);
        vm.stopPrank();

        assertEq(musdc.balanceOf(alice), 1_000e6);
    }

    function test_RevertWhen_RedeemZero() public {
        vm.expectRevert(MintRedeemController.ZeroAmount.selector);
        vm.prank(alice);
        controller.redeem(0);
    }

    function test_RevertWhen_RedeemDust() public {
        uint256 dust = 1e12 - 1;

        vm.expectRevert(
            abi.encodeWithSelector(MintRedeemController.NotMultipleOfScale.selector, dust, SCALE)
        );
        vm.prank(alice);
        controller.redeem(dust);
    }

    function test_RevertWhen_RedeemNotCompliant() public {
        uint256 coll = 10e6;

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);
        controller.mint(coll);
        dusd.approve(address(controller), coll * SCALE);
        vm.stopPrank();

        vm.prank(admin);
        policy.setBlocked(alice, true);

        vm.expectRevert(abi.encodeWithSelector(MintRedeemController.NotCompliant.selector, alice));
        vm.prank(alice);
        controller.redeem(coll * SCALE);
    }

    function test_RevertWhen_RedeemWithoutAllowance() public {
        uint256 coll = 10e6;

        vm.startPrank(alice);
        musdc.approve(address(vault), coll);
        controller.mint(coll);
        vm.stopPrank();

        vm.expectRevert(); // ERC20InsufficientAllowance
        vm.prank(alice);
        controller.redeem(coll * SCALE);
    }

    function test_RevertWhen_RedeemMoreThanBalance() public {
        vm.expectRevert(); // burnFrom fails
        vm.prank(alice);
        controller.redeem(100e18);
    }

    // ---------------------------------------------------------------------
    // Fuzz
    // ---------------------------------------------------------------------

    function testFuzz_MintScalesExactly(uint256 collateralAmount) public {
        collateralAmount = bound(collateralAmount, 1, 10_000e6);

        vm.prank(admin);
        musdc.mint(alice, collateralAmount);

        vm.startPrank(alice);
        musdc.approve(address(vault), collateralAmount);
        controller.mint(collateralAmount);
        vm.stopPrank();

        assertEq(dusd.balanceOf(alice), collateralAmount * SCALE);
        assertEq(vault.deposits(alice), collateralAmount);
    }

    function testFuzz_RedeemDustReverts(uint256 amount) public {
        amount = bound(amount, 1, 1e18);
        vm.assume(amount % SCALE != 0);

        vm.expectRevert(
            abi.encodeWithSelector(MintRedeemController.NotMultipleOfScale.selector, amount, SCALE)
        );
        vm.prank(alice);
        controller.redeem(amount);
    }

    function testFuzz_BlockedCannotMint(address account, uint256 amount) public {
        vm.assume(account != address(0) && account != address(controller));
        amount = bound(amount, 1, 1_000e6);

        vm.prank(admin);
        policy.setBlocked(account, true);

        vm.expectRevert(abi.encodeWithSelector(MintRedeemController.NotCompliant.selector, account));
        vm.prank(account);
        controller.mint(amount);
    }
}
