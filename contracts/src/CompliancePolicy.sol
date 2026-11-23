// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ICompliance } from "./interfaces/ICompliance.sol";

/// @title CompliancePolicy
/// @author Men6d656e
/// @notice Allowlist, blocklist and jurisdiction policy for the dUSD system.
/// @dev This contract answers one question, {isAllowed}, and records why. It holds
///      no funds and has no pause: pausing a compliance gate would be a bypass, so
///      the emergency brake lives in the token and the controller instead.
///
///      Three rules, evaluated in a fixed order:
///      1. the zero address is never allowed;
///      2. a blocked account is denied, always, even if it is allowlisted;
///      3. if allowlist mode is on, only allowlisted accounts pass;
///      4. if jurisdiction checking is on, only allowed jurisdiction codes pass.
///
///      Every setter is role-gated by COMPLIANCE_ROLE and emits an event carrying
///      the operator, so the off-chain compliance page can render an audit trail
///      from logs alone. The only data stored per address is a boolean and a
///      three-digit ISO 3166-1 numeric country code: no names, no documents, no
///      personal data.
///
///      Enforcement lives in the callers. The MintRedeemController checks
///      {isAllowed} on mint and redeem, and the dUSD token checks it on both sides
///      of every transfer, so a block applies to new business and to movement of
///      existing balances alike.
contract CompliancePolicy is ICompliance, AccessControl {
    /// @notice Role allowed to change every policy setting.
    /// @dev Held by the compliance operator, never by the controller. The controller
    ///      only reads the policy, so a compromised controller cannot unblock itself.
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    /// @notice When true, only allowlisted addresses may use the system.
    bool public allowlistEnabled;

    /// @notice When true, only allowed jurisdiction codes may use the system.
    bool public jurisdictionCheckEnabled;

    /// @dev Addresses explicitly permitted while allowlist mode is on.
    mapping(address account => bool) private _allowlisted;

    /// @dev Addresses explicitly denied. A block outranks every allowance.
    mapping(address account => bool) private _blocked;

    /// @dev ISO 3166-1 numeric code per address. Zero means "not recorded".
    mapping(address account => uint16) private _jurisdiction;

    /// @notice Jurisdiction codes that may use the system while the check is on.
    /// @dev Code zero can never be allowed: "unknown" must not become a blanket pass.
    mapping(uint16 code => bool) public jurisdictionAllowed;

    /// @notice Thrown when a zero address is passed where a real account is required.
    error ZeroAddress();

    /// @notice Thrown when a setter would write the value already stored.
    /// @dev Guards the audit trail: an event that announces no change is noise, and
    ///      noise is where real policy changes hide.
    error NoChange();

    /// @notice Thrown when zero is used as a jurisdiction code in the allow table.
    error InvalidJurisdictionCode();

    /// @notice Emitted when allowlist mode is switched.
    event AllowlistModeUpdated(bool enabled, address indexed operator);

    /// @notice Emitted when the jurisdiction check is switched.
    event JurisdictionCheckUpdated(bool enabled, address indexed operator);

    /// @notice Emitted when an address enters or leaves the allowlist.
    event AllowlistUpdated(address indexed account, bool allowed, address indexed operator);

    /// @notice Emitted when an address is blocked or unblocked.
    event BlocklistUpdated(address indexed account, bool blocked, address indexed operator);

    /// @notice Emitted when an address's jurisdiction code is set or cleared.
    event JurisdictionUpdated(
        address indexed account, uint16 jurisdictionCode, address indexed operator
    );

    /// @notice Emitted when a jurisdiction code is allowed or disallowed.
    event JurisdictionAllowanceUpdated(
        uint16 indexed jurisdictionCode, bool allowed, address indexed operator
    );

    /// @notice Deploys an open policy and grants the admin both roles.
    /// @dev Open means allowlist mode off and jurisdiction checking off, so every
    ///      address except the zero address is allowed until an operator decides
    ///      otherwise. The admin receives DEFAULT_ADMIN_ROLE and COMPLIANCE_ROLE so
    ///      a single key can run the demo; production should split them.
    /// @param admin Account that administers roles and may change policy at first.
    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
    }

    /// @inheritdoc ICompliance
    function isAllowed(address account) public view returns (bool) {
        if (account == address(0)) return false;
        if (_blocked[account]) return false;
        if (allowlistEnabled && !_allowlisted[account]) return false;
        if (jurisdictionCheckEnabled && !jurisdictionAllowed[_jurisdiction[account]]) return false;
        return true;
    }

    /// @notice Whether `account` is on the allowlist.
    /// @dev Being allowlisted is not permission while a block is active; use
    ///      {isAllowed} for the effective answer.
    /// @param account Address being read.
    /// @return listed True when the address is on the allowlist.
    function isAllowlisted(address account) external view returns (bool listed) {
        return _allowlisted[account];
    }

    /// @notice Whether `account` is blocked.
    /// @param account Address being read.
    /// @return blocked True when the address is blocked.
    function isBlocked(address account) external view returns (bool blocked) {
        return _blocked[account];
    }

    /// @inheritdoc ICompliance
    function jurisdictionOf(address account) external view returns (uint16 code) {
        return _jurisdiction[account];
    }

    /// @notice Turns allowlist mode on or off.
    /// @dev Only COMPLIANCE_ROLE. Turning it on does not clear the blocklist, and
    ///      turning it off does not unblock anyone.
    /// @param enabled True to require an allowlist entry, false for open access.
    function setAllowlistEnabled(bool enabled) external onlyRole(COMPLIANCE_ROLE) {
        if (allowlistEnabled == enabled) revert NoChange();
        allowlistEnabled = enabled;
        emit AllowlistModeUpdated(enabled, msg.sender);
    }

    /// @notice Turns jurisdiction checking on or off.
    /// @dev Only COMPLIANCE_ROLE. While on, an address whose code is not in the
    ///      allowed table is denied, including an address with no code recorded.
    /// @param enabled True to require an allowed jurisdiction code.
    function setJurisdictionCheckEnabled(bool enabled) external onlyRole(COMPLIANCE_ROLE) {
        if (jurisdictionCheckEnabled == enabled) revert NoChange();
        jurisdictionCheckEnabled = enabled;
        emit JurisdictionCheckUpdated(enabled, msg.sender);
    }

    /// @notice Adds `account` to, or removes it from, the allowlist.
    /// @dev Only COMPLIANCE_ROLE. Allowlisting a blocked address changes nothing
    ///      until the block is lifted; the block is checked first.
    /// @param account Address to update; must not be zero.
    /// @param allowed True to allowlist, false to remove.
    function setAllowlisted(address account, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        if (_allowlisted[account] == allowed) revert NoChange();
        _allowlisted[account] = allowed;
        emit AllowlistUpdated(account, allowed, msg.sender);
    }

    /// @notice Blocks or unblocks `account`.
    /// @dev Only COMPLIANCE_ROLE. A block outranks the allowlist and every
    ///      jurisdiction allowance, so this is the one switch that always denies.
    /// @param account Address to update; must not be zero.
    /// @param blocked True to block, false to unblock.
    function setBlocked(address account, bool blocked) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        if (_blocked[account] == blocked) revert NoChange();
        _blocked[account] = blocked;
        emit BlocklistUpdated(account, blocked, msg.sender);
    }

    /// @notice Records the ISO 3166-1 numeric jurisdiction of `account`.
    /// @dev Only COMPLIANCE_ROLE. Passing zero clears the record. The code is a
    ///      country number, not personal data: 840 is the United States, 826 the
    ///      United Kingdom, 050 Bangladesh, 356 India.
    /// @param account Address to update; must not be zero.
    /// @param code ISO 3166-1 numeric code, or zero to clear.
    function setJurisdiction(address account, uint16 code) external onlyRole(COMPLIANCE_ROLE) {
        if (account == address(0)) revert ZeroAddress();
        if (_jurisdiction[account] == code) revert NoChange();
        _jurisdiction[account] = code;
        emit JurisdictionUpdated(account, code, msg.sender);
    }

    /// @notice Allows or disallows a jurisdiction code.
    /// @dev Only COMPLIANCE_ROLE. Zero is rejected: an unrecorded jurisdiction must
    ///      never pass the check by accident.
    /// @param code ISO 3166-1 numeric code; must not be zero.
    /// @param allowed True to allow the code, false to deny it.
    function setJurisdictionAllowed(uint16 code, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        if (code == 0) revert InvalidJurisdictionCode();
        if (jurisdictionAllowed[code] == allowed) revert NoChange();
        jurisdictionAllowed[code] = allowed;
        emit JurisdictionAllowanceUpdated(code, allowed, msg.sender);
    }
}
