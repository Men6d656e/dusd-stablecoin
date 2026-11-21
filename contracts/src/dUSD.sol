// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title dUSD
/// @author Men6d656e
/// @notice 18-decimal demo stablecoin, pegged 1 dUSD = 1 DEMO-USD and backed 1:1 by
///         mUSDC held in the ReserveVault.
/// @dev Supply is elastic and deliberately uncapped in code: the real limit is the
///      reserve invariant `totalSupply() <= vault.totalAssets()`, enforced by the
///      controller in a later build step and checked by the invariant tests.
///
///      Decimals are ERC-20's default of 18; this contract does not override
///      `decimals()`. The 6-decimal mUSDC to 18-decimal dUSD conversion (x1e12)
///      belongs to the controller, never to this token.
///
///      Minting is role-gated (`MINTER_ROLE`) because only the controller may create
///      supply. Burning is the standard ERC-20Burnable surface: holders may burn
///      their own tokens, and a spender may burn with an allowance. There is no
///      privileged "burn anyone" function, so no key can destroy a user's balance
///      without that user's consent.
///
///      `PAUSER_ROLE` may pause all token movement. OpenZeppelin's ERC20Pausable
///      pauses transfers, minting and burning together, so a pause also blocks
///      redemption. That is deliberate: pause is an emergency brake, not a routine
///      tool, and the README states the consequence.
contract dUSD is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    /// @notice Role allowed to mint new supply. Granted to the deployer at first,
    ///         then to the MintRedeemController.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role allowed to pause and unpause all token movement.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Thrown when the admin address passed to the constructor is zero.
    error ZeroAddress();

    /// @notice Thrown when a mint of zero tokens is attempted.
    error ZeroAmount();

    /// @notice Deploys the token and grants every role to `admin`.
    /// @dev The admin receives `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE`
    ///      so the demo can run from one key. Production should split these across a
    ///      multisig (admin), the controller (minter) and an operator (pauser).
    /// @param admin Account that administers roles and may mint and pause at first.
    constructor(address admin) ERC20("dUSD Stablecoin", "dUSD") {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /// @notice Creates `amount` new dUSD and sends it to `to`.
    /// @dev Only `MINTER_ROLE`. In the finished system the minter is the
    ///      MintRedeemController, which mints only after collateral has arrived in
    ///      the vault. A zero amount is rejected so a mistaken call cannot emit a
    ///      meaningless Transfer event.
    /// @param to Recipient of the new supply.
    /// @param amount Amount in 18-decimal base units (1 dUSD = 1e18).
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (amount == 0) revert ZeroAmount();
        _mint(to, amount);
    }

    /// @notice Pauses every transfer, mint and burn.
    /// @dev Only `PAUSER_ROLE`. Use for an active incident; unpause as soon as the
    ///      incident is contained, because holders cannot redeem while paused.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resumes normal token movement after a pause.
    /// @dev Only `PAUSER_ROLE`.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @dev Required because both ERC20 and ERC20Pausable define `_update`. The
    ///      `super` call walks the inheritance chain, so the pause check runs before
    ///      the balance write. Without this override the contract does not compile.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
