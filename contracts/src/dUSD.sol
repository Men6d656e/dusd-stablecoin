// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ICompliance } from "./interfaces/ICompliance.sol";

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
///
///      Every transfer is filtered by {COMPLIANCE}: both the sender and the
///      recipient must pass {ICompliance.isAllowed}. Mint and burn skip the check
///      because their entry points are already gated (the controller checks the
///      account before minting or burning) and because the zero address can never
///      pass a policy. The policy is immutable, so swapping it means redeploying
///      the token, which is rare and visible.
contract dUSD is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    /// @notice Role allowed to mint new supply. Granted to the deployer at first,
    ///         then to the MintRedeemController.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role allowed to pause and unpause all token movement.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice The policy every transfer must pass, both sender and recipient.
    ICompliance public immutable COMPLIANCE;

    /// @notice Thrown when the admin or policy address passed to the constructor is zero.
    error ZeroAddress();

    /// @notice Thrown when a mint of zero tokens is attempted.
    error ZeroAmount();

    /// @notice Thrown when a transfer involves an address the policy denies.
    /// @param from Sender of the blocked transfer.
    /// @param to Recipient of the blocked transfer.
    error TransferNotCompliant(address from, address to);

    /// @notice Deploys the token and grants every role to `admin`.
    /// @dev The admin receives `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE`
    ///      so the demo can run from one key. Production should split these across a
    ///      multisig (admin), the controller (minter) and an operator (pauser).
    ///
    ///      A zero policy is rejected on purpose. A token deployed with no policy
    ///      would silently allow every transfer, which is the exact gap this hook
    ///      closes, and the failure would be invisible until someone abused it.
    /// @param admin Account that administers roles and may mint and pause at first.
    /// @param compliance Policy consulted before every transfer; must not be zero.
    constructor(address admin, ICompliance compliance) ERC20("dUSD Stablecoin", "dUSD") {
        if (admin == address(0) || address(compliance) == address(0)) revert ZeroAddress();

        COMPLIANCE = compliance;

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
    ///      compliance gate runs before `super`, so a blocked transfer reverts with
    ///      {TransferNotCompliant} even while the token is paused; the pause check is
    ///      the next line of defence, not the first.
    ///
    ///      `from == address(0)` is mint and `to == address(0)` is burn. Both are
    ///      already gated at their entry points, so the hook skips them; that is
    ///      also what lets the controller mint to a user and burn from a user
    ///      without asking the policy about the zero address.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        if (from != address(0) && to != address(0)) {
            if (!COMPLIANCE.isAllowed(from) || !COMPLIANCE.isAllowed(to)) {
                revert TransferNotCompliant(from, to);
            }
        }

        super._update(from, to, value);
    }
}
