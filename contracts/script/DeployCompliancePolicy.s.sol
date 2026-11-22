// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { CompliancePolicy } from "../src/CompliancePolicy.sol";

/// @title DeployCompliancePolicy
/// @author Men6d656e
/// @notice Deploys the compliance policy in its open state and prints what to record.
/// @dev `COMPLIANCE_ADMIN` is optional and defaults to the broadcasting sender. Use a
///      Foundry keystore, never a private key on the command line:
///
///      COMPLIANCE_ADMIN=0x... forge script script/DeployCompliancePolicy.s.sol:DeployCompliancePolicy \
///        --rpc-url "$BASE_SEPOLIA_RPC_URL" \
///        --account deployer --sender "$DEPLOYER_ADDRESS" \
///        --broadcast --verify --slow
///
///      The policy deploys open: allowlist mode off, jurisdiction checking off. That
///      is deliberate. A policy that starts closed would block the first mint and
///      look like a controller bug.
contract DeployCompliancePolicy is Script {
    /// @notice Deploys the policy and prints the values a deployer must record.
    /// @dev The return value is unused by Foundry; it exists so another script or a
    ///      test can compose this deployment.
    /// @return policy The deployed CompliancePolicy instance.
    function run() external returns (CompliancePolicy policy) {
        address deployer = msg.sender;
        address admin = vm.envOr("COMPLIANCE_ADMIN", deployer);

        vm.startBroadcast();
        policy = new CompliancePolicy(admin);
        vm.stopBroadcast();

        console2.log("CompliancePolicy deployed at:", address(policy));
        console2.log("Admin (admin + compliance):", admin);
        console2.log("Allowlist enabled:", policy.allowlistEnabled());
        console2.log("Jurisdiction check enabled:", policy.jurisdictionCheckEnabled());
        console2.log("Zero address allowed:", policy.isAllowed(address(0)));
    }
}
