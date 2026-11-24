// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script } from "forge-std/Script.sol";
import { console2 } from "forge-std/console2.sol";
import { ICompliance } from "../src/interfaces/ICompliance.sol";
import { MockUSDC } from "../src/MockUSDC.sol";
import { CompliancePolicy } from "../src/CompliancePolicy.sol";
import { ReserveVault } from "../src/ReserveVault.sol";
import { dUSD } from "../src/dUSD.sol";
import { MintRedeemController } from "../src/MintRedeemController.sol";
import { TokenFaucet } from "../src/TokenFaucet.sol";
import { FixedPriceSource } from "../src/price/FixedPriceSource.sol";

/// @title DeployAll
/// @author Men6d656e
/// @notice Deploys and wires the whole dUSD system in one broadcast.
/// @dev The broadcasting account is the admin and owner of every contract. That is
///      deliberate: a single key removes the cross-key wiring failure that the
///      per-contract scripts require. Use a Foundry keystore, never a private key:
///
///      forge script script/DeployAll.s.sol:DeployAll \
///        --rpc-url "$BASE_SEPOLIA_RPC_URL" \
///        --account deployer --sender "$DEPLOYER_ADDRESS" \
///        --broadcast --verify --slow
///
///      Faucet economics are optional env vars, in 6-decimal mUSDC units:
///      FAUCET_AMOUNT (default 100 mUSDC), FAUCET_COOLDOWN (default 1 day),
///      FAUCET_CAP (default 500 mUSDC).
contract DeployAll is Script {
    struct Deployment {
        MockUSDC musdc;
        CompliancePolicy policy;
        ReserveVault vault;
        dUSD dusd;
        MintRedeemController controller;
        TokenFaucet faucet;
        FixedPriceSource priceSource;
    }

    /// @notice Deploys every contract, wires the controller and hands mUSDC to the faucet.
    /// @return d Every deployed address, so a test or another script can compose this.
    function run() external returns (Deployment memory d) {
        address deployer = msg.sender;
        uint256 faucetAmount = vm.envOr("FAUCET_AMOUNT", uint256(100_000_000));
        uint256 faucetCooldown = vm.envOr("FAUCET_COOLDOWN", uint256(86_400));
        uint256 faucetCap = vm.envOr("FAUCET_CAP", uint256(500_000_000));

        vm.startBroadcast();

        d.policy = new CompliancePolicy(deployer);
        d.musdc = new MockUSDC(deployer);
        d.vault = new ReserveVault(d.musdc, deployer);
        d.dusd = new dUSD(deployer, ICompliance(address(d.policy)));
        d.controller = new MintRedeemController(d.policy, d.dusd, d.vault);
        d.faucet = new TokenFaucet(d.policy, d.musdc, faucetAmount, faucetCooldown, faucetCap);
        d.priceSource = new FixedPriceSource();

        d.vault.setController(address(d.controller));
        d.dusd.grantRole(d.dusd.MINTER_ROLE(), address(d.controller));
        d.musdc.transferOwnership(address(d.faucet));

        vm.stopBroadcast();

        console2.log("=== DeployAll complete ===");
        console2.log("chainId:", block.chainid);
        console2.log("deployer:", deployer);
        console2.log("MockUSDC:", address(d.musdc));
        console2.log("CompliancePolicy:", address(d.policy));
        console2.log("ReserveVault:", address(d.vault));
        console2.log("dUSD:", address(d.dusd));
        console2.log("MintRedeemController:", address(d.controller));
        console2.log("TokenFaucet:", address(d.faucet));
        console2.log("FixedPriceSource:", address(d.priceSource));
        console2.log("Faucet amount (6 decimals):", faucetAmount);
        console2.log("Faucet cooldown (seconds):", faucetCooldown);
        console2.log("Faucet cap (6 decimals):", faucetCap);
        console2.log("Wiring: vault controller, dUSD minter, mUSDC owner = done");
    }
}
