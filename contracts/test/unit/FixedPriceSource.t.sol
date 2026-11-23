// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { IPriceSource } from "../../src/interfaces/IPriceSource.sol";
import { FixedPriceSource } from "../../src/price/FixedPriceSource.sol";

/// @dev Minimal consumer used to prove the seam works through the interface, not
///      through the concrete contract. A future controller or frontend adapter has
///      this exact shape: hold an IPriceSource, read one number.
contract PriceReader {
    IPriceSource private immutable SOURCE;

    constructor(IPriceSource source) {
        SOURCE = source;
    }

    function read() external view returns (uint256) {
        return SOURCE.price();
    }
}

/// @title FixedPriceSourceTest
/// @notice Behavioural spec for the v1 price seam.
/// @dev Every test carries a dev note stating what it proves. The contract is two
///      lines, so the tests focus on the properties a price consumer relies on:
///      parity, 18 decimals, no state, and readability through the interface.
contract FixedPriceSourceTest is Test {
    FixedPriceSource private source;

    function setUp() public {
        source = new FixedPriceSource();
    }

    /// @dev Proves the source returns parity in 18-decimal fixed point. A consumer
    ///      multiplies by this value and divides by 1e18, so a wrong scale is a
    ///      1e12-sized error in the money path.
    function test_PriceIsParity() public view {
        assertEq(source.price(), 1e18);
    }

    /// @dev Proves the public constant and the function agree. Two ways to read the
    ///      same number must never drift apart.
    function test_PriceMatchesPublicConstant() public view {
        assertEq(source.price(), source.PRICE());
    }

    /// @dev Proves the scale is exactly 18 decimals: one whole unit, no remainder.
    ///      This is the `decimals()` contract without needing a decimals function.
    function test_PriceIsExactlyEighteenDecimals() public view {
        assertEq(source.PRICE(), 10 ** 18);
        assertEq(source.PRICE() / 1e18, 1);
        assertEq(source.PRICE() % 1e18, 0);
    }

    /// @dev Proves repeated calls return the same value. A price that changes between
    ///      two reads in one transaction would make every quote ambiguous.
    function test_PriceIsStableAcrossCalls() public view {
        assertEq(source.price(), source.price());
    }

    /// @dev Proves the call does not depend on the caller. A price source must not
    ///      quote differently for a privileged address.
    function testFuzz_PriceIgnoresCaller(address caller) public {
        vm.prank(caller);
        assertEq(source.price(), 1e18);
    }

    /// @dev Proves the call does not depend on time. With no oracle there is no
    ///      staleness window, and a future consumer must not assume one exists.
    function testFuzz_PriceIgnoresTime(uint64 jump) public {
        vm.warp(block.timestamp + uint64(bound(jump, 0, 3650 days)));
        assertEq(source.price(), 1e18);
    }

    /// @dev Proves a consumer that types the dependency as IPriceSource compiles and
    ///      reads the same value. This is the seam the interface exists for.
    function test_InterfaceSeamReadsThroughIPriceSource() public view {
        IPriceSource seam = IPriceSource(address(source));
        assertEq(seam.price(), 1e18);
    }

    /// @dev Proves an external consumer contract can hold the source and read it.
    ///      The next module that needs a price can copy this shape.
    function test_ConsumerReadsThroughInterface() public {
        PriceReader reader = new PriceReader(source);
        assertEq(reader.read(), 1e18);
    }

    /// @dev Proves the price is never zero. A zero quote is a silent value loss for
    ///      every consumer, so it must be impossible even in the fixed source.
    function test_PriceNeverZero() public view {
        assertGt(source.price(), 0);
    }
}
