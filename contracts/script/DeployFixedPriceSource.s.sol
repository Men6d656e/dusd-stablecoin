// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { FixedPriceSource } from "../src/price/FixedPriceSource.sol";

/// @title DeployFixedPriceSource
/// @author Men6d656e
/// @notice Deploys the v1 price seam and prints what a deployer must record.
/// @dev No env vars and no constructor arguments. The source is stateless, so the
///      deploy is the whole configuration. Nothing consumes it yet: the controller
///      enforces the peg with its fixed 1e12 scaling, not with a price lookup.
///      Wiring a price into the money path is a separate, tested change.
contract DeployFixedPriceSource is Script {
    /// @notice Deploys the source and prints its address and price.
    /// @return source The deployed FixedPriceSource instance.
    function run() external returns (FixedPriceSource source) {
        vm.startBroadcast();
        source = new FixedPriceSource();
        vm.stopBroadcast();

        console2.log("FixedPriceSource deployed at:", address(source));
        console2.log("Price (1e18):", source.price());
        console2.log("Decimals: 18");
        console2.log("Wiring: none - no consumer in v1");
    }
}
