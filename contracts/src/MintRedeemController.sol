// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ICompliance } from "./interfaces/ICompliance.sol";
import { dUSD } from "./dUSD.sol";
import { ReserveVault } from "./ReserveVault.sol";

/// @title MintRedeemController
/// @author Men6d656e
/// @notice The single money path for the dUSD system: mint dUSD against mUSDC
///         collateral, and redeem dUSD back into mUSDC.
/// @dev This is the first contract that spends the compliance policy's answer.
///      It holds no funds of its own: collateral lives in the {ReserveVault} and
///      supply lives in {dUSD}. The controller only orchestrates the two.
///
///      Scaling is fixed and lives here and only here:
///      - 1 mUSDC (1e6 base units) mints 1 dUSD (1e18 base units), factor 1e12.
///      - a redeem amount that is not a multiple of 1e12 reverts, so no silent
///        dust is created or destroyed.
///
///      Order of operations is the security property:
///      1. check compliance first, before any state change;
///      2. move collateral into the vault;
///      3. then mint supply.
///      On redeem: burn supply first, then release collateral. A check after a
///      transfer is a check that cannot stop anything.
///
///      The compliance policy is immutable: swapping policy means redeploying the
///      controller, which is rare and visible. The vault and token are immutable
///      for the same reason.
contract MintRedeemController is ReentrancyGuard {
    /// @dev Collateral base units to dUSD base units: 1e18 / 1e6 = 1e12.
    uint256 public constant SCALE = 1e12;

    /// @notice The compliance policy consulted before every mint and redeem.
    ICompliance public immutable COMPLIANCE;

    /// @notice The 18-decimal dUSD token this controller mints and burns.
    dUSD public immutable DUSD;

    /// @notice The vault that holds mUSDC collateral.
    ReserveVault public immutable VAULT;

    /// @notice Thrown when a constructor argument is the zero address.
    error ZeroAddress();

    /// @notice Thrown when an amount of zero is passed to mint or redeem.
    error ZeroAmount();

    /// @notice Thrown when `account` is not allowed by the compliance policy.
    error NotCompliant(address account);

    /// @notice Thrown when a redeem amount is not a multiple of {SCALE}.
    /// @dev Prevents silent dust: 1 dUSD is the smallest redeemable unit.
    error NotMultipleOfScale(uint256 amount, uint256 scale);

    /// @notice Emitted after collateral is deposited and dUSD is minted.
    event Minted(address indexed account, uint256 collateralAmount, uint256 dusdAmount);

    /// @notice Emitted after dUSD is burned and collateral is released.
    event Redeemed(address indexed account, uint256 dusdAmount, uint256 collateralAmount);

    /// @notice Wires the policy, token and vault together.
    /// @dev The deployer must then grant {dUSD.MINTER_ROLE} to this controller
    ///      and call {ReserveVault.setController} with this address. Both are
    ///      documented in the README; the constructor cannot do them because the
    ///      dUSD admin and the vault owner may be different keys.
    /// @param compliance_ Policy consulted on every operation.
    /// @param dusd_ Token to mint and burn.
    /// @param vault_ Vault that holds collateral.
    constructor(ICompliance compliance_, dUSD dusd_, ReserveVault vault_) {
        if (
            address(compliance_) == address(0) || address(dusd_) == address(0)
                || address(vault_) == address(0)
        ) revert ZeroAddress();

        COMPLIANCE = compliance_;
        DUSD = dusd_;
        VAULT = vault_;
    }

    /// @notice Mints dUSD to `msg.sender` against `collateralAmount` of mUSDC.
    /// @dev The user must approve the vault (not this controller) for the
    ///      collateral: {ReserveVault.depositFor} pulls it directly, so a
    ///      malicious controller can never move more than the user approved.
    ///      Compliance is checked before the first state change.
    /// @param collateralAmount Amount of mUSDC in 6-decimal base units.
    function mint(uint256 collateralAmount) external nonReentrant {
        if (!COMPLIANCE.isAllowed(msg.sender)) revert NotCompliant(msg.sender);
        if (collateralAmount == 0) revert ZeroAmount();

        VAULT.depositFor(msg.sender, collateralAmount);

        uint256 dusdAmount = collateralAmount * SCALE;
        DUSD.mint(msg.sender, dusdAmount);

        emit Minted(msg.sender, collateralAmount, dusdAmount);
    }

    /// @notice Burns dUSD from `msg.sender` and releases matching mUSDC.
    /// @dev The user must approve this controller for the dUSD amount, because
    ///      {dUSD.burnFrom} consumes an allowance. Compliance is checked before
    ///      the first state change. The amount must be a multiple of {SCALE};
    ///      otherwise the redemption would create or destroy dust.
    /// @param dusdAmount Amount of dUSD in 18-decimal base units.
    function redeem(uint256 dusdAmount) external nonReentrant {
        if (!COMPLIANCE.isAllowed(msg.sender)) revert NotCompliant(msg.sender);
        if (dusdAmount == 0) revert ZeroAmount();
        if (dusdAmount % SCALE != 0) revert NotMultipleOfScale(dusdAmount, SCALE);

        DUSD.burnFrom(msg.sender, dusdAmount);

        uint256 collateralAmount = dusdAmount / SCALE;
        VAULT.releaseTo(msg.sender, collateralAmount);

        emit Redeemed(msg.sender, dusdAmount, collateralAmount);
    }
}
