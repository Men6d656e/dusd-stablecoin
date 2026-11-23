// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { ICompliance } from "../src/interfaces/ICompliance.sol";
import { dUSD } from "../src/dUSD.sol";
import { ReserveVault } from "../src/ReserveVault.sol";
import { MintRedeemController } from "../src/MintRedeemController.sol";

/// @title DeployMintRedeemController
/// @author Men6d656e
/// @notice Deploys the mint/redeem controller against already deployed contracts.
/// @dev Required env vars:
///      - DUSD_ADDRESS        deployed dUSD
///      - VAULT_ADDRESS       deployed ReserveVault
///      - COMPLIANCE_ADDRESS  deployed CompliancePolicy (or any ICompliance)
///
///      After deploy, two wiring transactions are still required and are NOT done
///      by this script, because their senders may be different keys:
///      1. dUSD admin: grant MINTER_ROLE to the controller address.
///      2. vault owner: setController(controller address).
///      The script prints the deployed address so you can run both.
contract DeployMintRedeemController is Script {
    function run() external returns (MintRedeemController controller) {
        address dusdAddr = vm.envAddress("DUSD_ADDRESS");
        address vaultAddr = vm.envAddress("VAULT_ADDRESS");
        address complianceAddr = vm.envAddress("COMPLIANCE_ADDRESS");

        vm.startBroadcast();
        controller = new MintRedeemController(
            ICompliance(complianceAddr), dUSD(dusdAddr), ReserveVault(vaultAddr)
        );
        vm.stopBroadcast();

        console2.log("MintRedeemController deployed at:", address(controller));
        console2.log("Compliance:", complianceAddr);
        console2.log("dUSD:", dusdAddr);
        console2.log("Vault:", vaultAddr);
        console2.log("Scale (1e12):", controller.SCALE());
    }
}
