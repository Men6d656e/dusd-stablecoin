// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title ICompliance
/// @author Men6d656e
/// @notice The read-only surface every enforcement point uses to ask one question:
///         may this address use the system right now?
/// @dev The controller depends on this interface, not on CompliancePolicy, so the
///      policy can be replaced by a stricter one without touching the money path.
///      A policy is a predicate, not a gatekeeper: it never moves funds, never
///      mints, and never burns. Callers decide what to do with a false answer.
interface ICompliance {
    /// @notice Whether `account` may mint, redeem or receive dUSD under current policy.
    /// @dev Implementations must return false for the zero address and must treat a
    ///      block as final: a blocked account is denied even if it is allowlisted.
    /// @param account Address being checked.
    /// @return allowed True only when every enabled rule accepts the account.
    function isAllowed(address account) external view returns (bool allowed);

    /// @notice The ISO 3166-1 numeric jurisdiction recorded for `account`.
    /// @dev Zero means "not recorded". The code is a three-digit country number, not
    ///      a name, address or document: no personal data is stored on-chain.
    /// @param account Address being read.
    /// @return code ISO 3166-1 numeric code, or zero when unset.
    function jurisdictionOf(address account) external view returns (uint16 code);
}
