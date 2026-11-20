// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/IERC6093.sol";
import { MockUSDC } from "../../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC private usdc;
    address private owner;
    address private alice;
    address private bob;

    uint256 private constant ONE_USDC = 1e6;

    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        usdc = new MockUSDC(owner);
    }

    function test_Metadata() public view {
        assertEq(usdc.name(), "Mock USD Coin");
        assertEq(usdc.symbol(), "mUSDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.totalSupply(), 0);
    }

    function test_OwnerIsInitialOwner() public view {
        assertEq(usdc.owner(), owner);
    }

    function test_RevertWhen_InitialOwnerIsZero() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new MockUSDC(address(0));
    }

    function test_OwnerCanMint() public {
        vm.prank(owner);
        usdc.mint(alice, 100 * ONE_USDC);

        assertEq(usdc.balanceOf(alice), 100 * ONE_USDC);
        assertEq(usdc.totalSupply(), 100 * ONE_USDC);
    }

    function test_MintEmitsTransferFromZero() public {
        vm.expectEmit(true, true, false, true, address(usdc));
        emit Transfer(address(0), alice, 25 * ONE_USDC);

        vm.prank(owner);
        usdc.mint(alice, 25 * ONE_USDC);
    }

    function test_RevertWhen_NonOwnerMints() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, bob));
        vm.prank(bob);
        usdc.mint(bob, ONE_USDC);
    }

    function test_RevertWhen_MintToZeroAddress() public {
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0))
        );
        vm.prank(owner);
        usdc.mint(address(0), ONE_USDC);
    }

    function test_TransferUsesSixDecimals() public {
        vm.prank(owner);
        usdc.mint(alice, 100 * ONE_USDC);

        vm.prank(alice);
        usdc.transfer(bob, 40 * ONE_USDC);

        assertEq(usdc.balanceOf(alice), 60 * ONE_USDC);
        assertEq(usdc.balanceOf(bob), 40 * ONE_USDC);
    }

    function testFuzz_MintAlwaysIncreasesSupply(address to, uint96 amount) public {
        vm.assume(to != address(0));

        vm.prank(owner);
        usdc.mint(to, uint256(amount));

        assertEq(usdc.balanceOf(to), uint256(amount));
        assertEq(usdc.totalSupply(), uint256(amount));
    }
}
