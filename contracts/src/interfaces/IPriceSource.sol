// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title IPriceSource
/// @author Men6d656e
/// @notice The read-only seam through which the dUSD system asks the price of one
///         unit of collateral, denominated in dUSD.
/// @dev Every implementation returns an 18-decimal fixed-point number, so a
///      consumer never has to ask the source for its decimals. The v1 source is
///      {FixedPriceSource}, which always returns 1e18 because the peg is 1:1 and
///      there is no oracle. A future oracle adapter implements this same function
///      and normalises the oracle's answer to 18 decimals.
///
///      This is a seam, not a dependency: the shipped controller does not call it
///      yet. That is deliberate. Wiring a price into the money path is a separate,
///      testable change, and until it exists the peg is enforced by the fixed
///      1e12 scaling in the controller, not by a price lookup.
interface IPriceSource {
    /// @notice Price of one unit of collateral in dUSD, 18-decimal fixed point.
    /// @dev 1e18 means parity (1 collateral unit = 1 dUSD). Implementations must
    ///      never return zero: a zero price would make every quote zero, which is a
    ///      silent value loss rather than a visible failure.
    /// @return price Price scaled by 1e18.
    function price() external view returns (uint256 price);
}
