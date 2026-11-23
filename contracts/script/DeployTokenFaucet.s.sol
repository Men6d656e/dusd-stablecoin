// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { ICompliance } from "../src/interfaces/ICompliance.sol";
import { MockUSDC } from "../src/MockUSDC.sol";
import { TokenFaucet } from "../src/TokenFaucet.sol";

/// @title DeployTokenFaucet
/// @author Men6d656e
/// @notice Deploys the demo mUSDC faucet against already deployed contracts.
/// @dev Required env vars:
///      - MUSDC_ADDRESS       deployed MockUSDC
///      - COMPLIANCE_ADDRESS  deployed CompliancePolicy (or any ICompliance)
///      - FAUCET_AMOUNT       mUSDC per claim, in 6-decimal base units
///      - FAUCET_COOLDOWN     seconds between claims
///      - FAUCET_CAP          lifetime maximum per address, in 6-decimal base units
///
///      After deploy, one wiring transaction is still required and is NOT done by
///      this script:
///      - the current MockUSDC owner must call transferOwnership(faucet), because
///        only the owner may mint. Until then every claim reverts.
///      The script prints the deployed address so the owner can run it.
contract DeployTokenFaucet is Script {
    /// @notice Deploys the faucet and prints the values a deployer must record.
    /// @return faucet The deployed TokenFaucet instance.
    function run() external returns (TokenFaucet faucet) {
        address musdcAddr = vm.envAddress("MUSDC_ADDRESS");
        address complianceAddr = vm.envAddress("COMPLIANCE_ADDRESS");
        uint256 amount = vm.envUint("FAUCET_AMOUNT");
        uint256 cooldown = vm.envUint("FAUCET_COOLDOWN");
        uint256 cap = vm.envUint("FAUCET_CAP");

        vm.startBroadcast();
        faucet = new TokenFaucet(
            ICompliance(complianceAddr), MockUSDC(musdcAddr), amount, cooldown, cap
        );
        vm.stopBroadcast();

        console2.log("TokenFaucet deployed at:", address(faucet));
        console2.log("mUSDC:", musdcAddr);
        console2.log("Compliance:", complianceAddr);
        console2.log("Amount per claim:", amount);
        console2.log("Cooldown (seconds):", cooldown);
        console2.log("Cap per address:", cap);
        console2.log("Wiring: mUSDC owner must call transferOwnership(faucet)");
    }
}
