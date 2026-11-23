// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IPriceSource } from "../interfaces/IPriceSource.sol";

/// @title FixedPriceSource
/// @author Men6d656e
/// @notice The v1 price seam: always returns parity, 1e18.
/// @dev There is no oracle in v1 and this contract does not pretend there is. The
///      peg is a product decision (1 dUSD = 1 DEMO-USD), so the price is a
///      constant. No admin, no setter, no storage: there is nothing to manipulate
///      and nothing to pause.
///
///      Why ship a constant at all: a future oracle adapter can implement
///      {IPriceSource} and be swapped in without changing the interface a consumer
///      already reads. The seam is the deliverable, not the number.
contract FixedPriceSource is IPriceSource {
    /// @notice Parity: one collateral unit equals one dUSD, scaled by 1e18.
    uint256 public constant PRICE = 1e18;

    /// @inheritdoc IPriceSource
    function price() external pure returns (uint256) {
        return PRICE;
    }
}
