// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReserveVault } from "../src/ReserveVault.sol";

/// @title DeployReserveVault
/// @author Men6d656e
/// @notice Deploys the collateral vault for an already deployed mUSDC.
/// @dev Set MUSDC_ADDRESS to the MockUSDC address. CONTROLLER_ADDRESS is optional;
///      leave it unset and the vault stays inert until the owner calls
///      setController. Run with a Foundry keystore:
///      MUSDC_ADDRESS=0x... forge script script/DeployReserveVault.s.sol:DeployReserveVault \
///        --rpc-url "$BASE_SEPOLIA_RPC_URL" \
///        --account deployer --sender "$DEPLOYER_ADDRESS" \
///        --broadcast --verify --slow
contract DeployReserveVault is Script {
    function run() external returns (ReserveVault vault) {
        address deployer = msg.sender;
        address collateral = vm.envAddress("MUSDC_ADDRESS");
        address controller = vm.envOr("CONTROLLER_ADDRESS", address(0));

        vm.startBroadcast();
        vault = new ReserveVault(IERC20(collateral), deployer);
        if (controller != address(0)) {
            vault.setController(controller);
        }
        vm.stopBroadcast();

        console2.log("ReserveVault deployed at:", address(vault));
        console2.log("Collateral (mUSDC):", collateral);
        console2.log("Owner:", deployer);
        console2.log("Controller:", controller);
    }
}
