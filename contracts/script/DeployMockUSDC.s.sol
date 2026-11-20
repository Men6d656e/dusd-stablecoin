// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { MockUSDC } from "../src/MockUSDC.sol";

/// @title DeployMockUSDC
/// @author Men6d656e
/// @notice Deploys the 6-decimal demo collateral and leaves supply at zero.
/// @dev Seed liquidity is a separate, deliberate mint — the deploy script never
///      creates tokens the deployer did not ask for. Run with a Foundry keystore:
///      forge script script/DeployMockUSDC.s.sol:DeployMockUSDC \
///        --rpc-url "$BASE_SEPOLIA_RPC_URL" \
///        --account deployer --sender "$DEPLOYER_ADDRESS" \
///        --broadcast --verify --slow
contract DeployMockUSDC is Script {
    function run() external returns (MockUSDC usdc) {
        address deployer = msg.sender;

        vm.startBroadcast();
        usdc = new MockUSDC(deployer);
        vm.stopBroadcast();

        console2.log("MockUSDC deployed at:", address(usdc));
        console2.log("Owner (mint authority):", deployer);
        console2.log("Decimals: 6  |  name: Mock USD Coin  |  symbol: mUSDC");
    }
}
