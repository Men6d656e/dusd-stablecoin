// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { dUSD } from "../src/dUSD.sol";

/// @title DeployDUSD
/// @author Men6d656e
/// @notice Deploys the 18-decimal dUSD token and grants every role to one admin.
/// @dev `DUSD_ADMIN` is optional and defaults to the broadcasting sender. Use a
///      Foundry keystore, never a private key on the command line:
///
///      DUSD_ADMIN=0x... forge script script/DeployDUSD.s.sol:DeployDUSD \
///        --rpc-url "$BASE_SEPOLIA_RPC_URL" \
///        --account deployer --sender "$DEPLOYER_ADDRESS" \
///        --broadcast --verify --slow
///
///      Supply starts at zero. Minting is a separate, deliberate transaction.
contract DeployDUSD is Script {
    /// @notice Deploys the token and prints the values a deployer must record.
    /// @dev The return value is unused by Foundry; it exists so another script or a
    ///      test can compose this deployment.
    /// @return token The deployed dUSD instance.
    function run() external returns (dUSD token) {
        address deployer = msg.sender;
        address admin = vm.envOr("DUSD_ADMIN", deployer);

        vm.startBroadcast();
        token = new dUSD(admin);
        vm.stopBroadcast();

        console2.log("dUSD deployed at:", address(token));
        console2.log("Admin (admin + minter + pauser):", admin);
        console2.log("Name:", token.name());
        console2.log("Symbol:", token.symbol());
        console2.log("Decimals:", token.decimals());
        console2.log("Total supply:", token.totalSupply());
    }
}
