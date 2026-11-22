// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { CompliancePolicy } from "../../src/CompliancePolicy.sol";

/// @title CompliancePolicyTest
/// @notice Behavioural spec for the allowlist, blocklist and jurisdiction policy.
/// @dev Every test carries a dev note stating what it proves and why the property
///      matters. Read the dev notes alone and you have the policy's contract with
///      its operators and users: who may change what, what a block outranks, and
///      which address must never be allowed.
contract CompliancePolicyTest is Test {
    CompliancePolicy private policy;

    address private admin;
    address private officer;
    address private alice;
    address private bob;

    /// @dev ISO 3166-1 numeric codes used by the demo. Named so a test reads as a
    ///      country decision instead of a magic number.
    uint16 private constant US = 840;
    uint16 private constant GB = 826;
    uint16 private constant BD = 50;
    uint16 private constant IN = 356;

    event AllowlistModeUpdated(bool enabled, address indexed operator);
    event JurisdictionCheckUpdated(bool enabled, address indexed operator);
    event AllowlistUpdated(address indexed account, bool allowed, address indexed operator);
    event BlocklistUpdated(address indexed account, bool blocked, address indexed operator);
    event JurisdictionUpdated(
        address indexed account, uint16 jurisdictionCode, address indexed operator
    );
    event JurisdictionAllowanceUpdated(
        uint16 indexed jurisdictionCode, bool allowed, address indexed operator
    );

    /// @dev Builds one fresh policy per test with the operator role split away from
    ///      the admin. Splitting the roles is what lets the negative tests prove the
    ///      gates exist instead of passing by accident.
    function setUp() public {
        admin = makeAddr("admin");
        officer = makeAddr("officer");
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        policy = new CompliancePolicy(admin);

        // Read the role hash before the prank: an external call in the argument list
        // would consume the prank and the grant would come from the test contract.
        bytes32 role = policy.COMPLIANCE_ROLE();
        vm.prank(admin);
        policy.grantRole(role, officer);
    }

    // ---------------------------------------------------------------------
    // Roles and defaults
    // ---------------------------------------------------------------------

    /// @dev Proves the role identifier is the documented string. Off-chain tooling
    ///      grants roles by hash; a renamed string would produce a role nobody holds.
    function test_RoleConstantMatchesDocumentedName() public view {
        assertEq(policy.COMPLIANCE_ROLE(), keccak256("COMPLIANCE_ROLE"));
    }

    /// @dev Proves the deployer receives admin and compliance rights. Without the
    ///      admin role no one could ever grant the operator role, and the policy
    ///      would be frozen open.
    function test_ConstructorGrantsAdminAndComplianceToAdmin() public view {
        assertTrue(policy.hasRole(policy.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(policy.hasRole(policy.COMPLIANCE_ROLE(), admin));
    }

    /// @dev Proves a zero admin is rejected. Roles held by the zero address can never
    ///      be exercised, which would brick policy administration at deploy time.
    function test_RevertWhen_AdminIsZero() public {
        vm.expectRevert(CompliancePolicy.ZeroAddress.selector);
        new CompliancePolicy(address(0));
    }

    /// @dev Proves the admin can hand the operator role to someone else and take it
    ///      back. Role transfer is the only way to rotate a compromised operator key.
    function test_AdminCanGrantAndRevokeComplianceRole() public {
        vm.startPrank(admin);
        policy.revokeRole(policy.COMPLIANCE_ROLE(), officer);
        assertFalse(policy.hasRole(policy.COMPLIANCE_ROLE(), officer));
        policy.grantRole(policy.COMPLIANCE_ROLE(), officer);
        assertTrue(policy.hasRole(policy.COMPLIANCE_ROLE(), officer));
        vm.stopPrank();
    }

    /// @dev Proves a fresh policy is open: both switches off, no codes, everyone but
    ///      the zero address allowed. A policy that starts closed would make the
    ///      first deposit impossible and look like a bug in the controller.
    function test_DefaultsAreOpen() public view {
        assertFalse(policy.allowlistEnabled());
        assertFalse(policy.jurisdictionCheckEnabled());
        assertTrue(policy.isAllowed(alice));
        assertEq(policy.jurisdictionOf(alice), 0);
    }

    /// @dev Proves the zero address is never allowed. Minting to zero is rejected by
    ///      ERC-20, but the predicate must not be the weak link that lets a caller
    ///      skip its own check.
    function test_ZeroAddressIsNeverAllowed() public view {
        assertFalse(policy.isAllowed(address(0)));
    }

    // ---------------------------------------------------------------------
    // Allowlist mode
    // ---------------------------------------------------------------------

    /// @dev Proves the operator can switch allowlist mode on and that the change is
    ///      announced with the operator address. The compliance page rebuilds its
    ///      state from these logs, so a silent switch would be invisible.
    function test_OfficerCanEnableAllowlist() public {
        vm.expectEmit(true, false, false, true, address(policy));
        emit AllowlistModeUpdated(true, officer);

        vm.prank(officer);
        policy.setAllowlistEnabled(true);

        assertTrue(policy.allowlistEnabled());
    }

    /// @dev Proves a stranger cannot switch allowlist mode. An open switch would let
    ///      anyone lock every holder out of minting and redemption.
    function test_RevertWhen_NonComplianceEnablesAllowlist() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                bob,
                policy.COMPLIANCE_ROLE()
            )
        );
        vm.prank(bob);
        policy.setAllowlistEnabled(true);
    }

    /// @dev Proves a no-op write is rejected. Repeating the current value would emit
    ///      an event that looks like a policy change and pollutes the audit trail.
    function test_RevertWhen_AllowlistModeUnchanged() public {
        vm.prank(officer);
        policy.setAllowlistEnabled(true);

        vm.expectRevert(CompliancePolicy.NoChange.selector);
        vm.prank(officer);
        policy.setAllowlistEnabled(true);
    }

    /// @dev Proves allowlist mode denies an address that was never listed. This is the
    ///      core of the mode: default deny, explicit allow.
    function test_AllowlistModeBlocksUnlistedAddress() public {
        vm.prank(officer);
        policy.setAllowlistEnabled(true);

        assertFalse(policy.isAllowed(alice));
        assertFalse(policy.isAllowed(bob));
    }

    /// @dev Proves an allowlisted address passes while the mode is on, and that the
    ///      entry is announced with the operator. Without the event there is no
    ///      evidence of who granted access to whom.
    function test_AllowlistModeAllowsListedAddress() public {
        vm.prank(officer);
        policy.setAllowlistEnabled(true);

        vm.expectEmit(true, true, false, true, address(policy));
        emit AllowlistUpdated(alice, true, officer);

        vm.prank(officer);
        policy.setAllowlisted(alice, true);

        assertTrue(policy.isAllowlisted(alice));
        assertTrue(policy.isAllowed(alice));
        assertFalse(policy.isAllowed(bob));
    }

    /// @dev Proves turning the mode off restores open access without clearing the
    ///      list. The list is evidence; the switch is policy. Mixing them would
    ///      destroy the record every time the operator opened the system.
    function test_DisablingAllowlistRestoresOpenAccess() public {
        vm.startPrank(officer);
        policy.setAllowlistEnabled(true);
        policy.setAllowlisted(alice, true);
        policy.setAllowlistEnabled(false);
        vm.stopPrank();

        assertTrue(policy.isAllowed(bob));
        assertTrue(policy.isAllowlisted(alice));
    }

    /// @dev Proves the zero address cannot be allowlisted. Listing it would be a
    ///      standing invitation for any bug that forwards a zero address.
    function test_RevertWhen_AllowlistingZeroAddress() public {
        vm.expectRevert(CompliancePolicy.ZeroAddress.selector);
        vm.prank(officer);
        policy.setAllowlisted(address(0), true);
    }

    /// @dev Proves a repeated allowlist write is rejected, so the event log contains
    ///      one entry per real change.
    function test_RevertWhen_AllowlistEntryUnchanged() public {
        vm.prank(officer);
        policy.setAllowlisted(alice, true);

        vm.expectRevert(CompliancePolicy.NoChange.selector);
        vm.prank(officer);
        policy.setAllowlisted(alice, true);
    }

    /// @dev Proves a stranger cannot allowlist themselves. Self-service access is the
    ///      difference between a policy engine and a suggestion.
    function test_RevertWhen_NonComplianceAllowlists() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                bob,
                policy.COMPLIANCE_ROLE()
            )
        );
        vm.prank(bob);
        policy.setAllowlisted(bob, true);
    }

    // ---------------------------------------------------------------------
    // Blocklist
    // ---------------------------------------------------------------------

    /// @dev Proves the operator can block and unblock, with an event for each step.
    ///      The pair matters: a block that cannot be lifted is a permanent seizure.
    function test_OfficerCanBlockAndUnblock() public {
        vm.expectEmit(true, true, false, true, address(policy));
        emit BlocklistUpdated(alice, true, officer);

        vm.prank(officer);
        policy.setBlocked(alice, true);
        assertTrue(policy.isBlocked(alice));
        assertFalse(policy.isAllowed(alice));

        vm.expectEmit(true, true, false, true, address(policy));
        emit BlocklistUpdated(alice, false, officer);

        vm.prank(officer);
        policy.setBlocked(alice, false);
        assertTrue(policy.isAllowed(alice));
    }

    /// @dev Proves a block denies even while allowlist mode is off. The blocklist is
    ///      the one rule that does not depend on another switch being enabled.
    function test_BlockedAddressDeniedWithAllowlistOff() public {
        vm.prank(officer);
        policy.setBlocked(alice, true);

        assertFalse(policy.allowlistEnabled());
        assertFalse(policy.isAllowed(alice));
        assertTrue(policy.isAllowed(bob));
    }

    /// @dev Proves a block outranks an allowlist entry. If the order were reversed, a
    ///      forgotten allowlist row would silently defeat a sanctions block.
    function test_BlockedWinsOverAllowlisted() public {
        vm.startPrank(officer);
        policy.setAllowlistEnabled(true);
        policy.setAllowlisted(alice, true);
        policy.setBlocked(alice, true);
        vm.stopPrank();

        assertTrue(policy.isAllowlisted(alice));
        assertFalse(policy.isAllowed(alice));
    }

    /// @dev Proves the zero address cannot be blocked. Blocking it would be a no-op
    ///      that still emits an event, which is exactly the noise the policy avoids.
    function test_RevertWhen_BlockingZeroAddress() public {
        vm.expectRevert(CompliancePolicy.ZeroAddress.selector);
        vm.prank(officer);
        policy.setBlocked(address(0), true);
    }

    /// @dev Proves a repeated block write is rejected, keeping the event log one
    ///      entry per real change.
    function test_RevertWhen_BlocklistEntryUnchanged() public {
        vm.prank(officer);
        policy.setBlocked(alice, true);

        vm.expectRevert(CompliancePolicy.NoChange.selector);
        vm.prank(officer);
        policy.setBlocked(alice, true);
    }

    /// @dev Proves a stranger cannot block anyone. An open blocklist is a cheap denial
    ///      of service against every holder.
    function test_RevertWhen_NonComplianceBlocks() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                bob,
                policy.COMPLIANCE_ROLE()
            )
        );
        vm.prank(bob);
        policy.setBlocked(alice, true);
    }

    // ---------------------------------------------------------------------
    // Jurisdiction
    // ---------------------------------------------------------------------

    /// @dev Proves a jurisdiction code can be recorded and read back with an event.
    ///      The code is the only per-address data beyond two booleans, and it is a
    ///      country number rather than personal data.
    function test_OfficerCanSetJurisdiction() public {
        vm.expectEmit(true, true, false, true, address(policy));
        emit JurisdictionUpdated(alice, BD, officer);

        vm.prank(officer);
        policy.setJurisdiction(alice, BD);

        assertEq(policy.jurisdictionOf(alice), BD);
    }

    /// @dev Proves zero clears the record. Erasure has to be possible for a policy
    ///      that claims to store no personal data.
    function test_ZeroClearsJurisdiction() public {
        vm.startPrank(officer);
        policy.setJurisdiction(alice, US);
        policy.setJurisdiction(alice, 0);
        vm.stopPrank();

        assertEq(policy.jurisdictionOf(alice), 0);
    }

    /// @dev Proves the zero address cannot carry a jurisdiction code. It has no
    ///      owner, so recording a country for it is meaningless data.
    function test_RevertWhen_JurisdictionIsZeroAddress() public {
        vm.expectRevert(CompliancePolicy.ZeroAddress.selector);
        vm.prank(officer);
        policy.setJurisdiction(address(0), US);
    }

    /// @dev Proves a repeated jurisdiction write is rejected, so the event log stays
    ///      one entry per real change.
    function test_RevertWhen_JurisdictionUnchanged() public {
        vm.prank(officer);
        policy.setJurisdiction(alice, US);

        vm.expectRevert(CompliancePolicy.NoChange.selector);
        vm.prank(officer);
        policy.setJurisdiction(alice, US);
    }

    /// @dev Proves jurisdiction checking denies a recorded code that is not allowed.
    ///      This is the sanctions-shaped rule: being known is not the same as being
    ///      permitted.
    function test_JurisdictionCheckBlocksUnlistedJurisdiction() public {
        vm.startPrank(officer);
        policy.setJurisdiction(alice, US);
        policy.setJurisdictionAllowed(GB, true);
        policy.setJurisdictionCheckEnabled(true);
        vm.stopPrank();

        assertFalse(policy.isAllowed(alice));
    }

    /// @dev Proves an allowed code passes, and that the allowance is announced with
    ///      the operator. The four demo codes come from wireframe 9.
    function test_JurisdictionCheckAllowsListedJurisdiction() public {
        vm.startPrank(officer);
        policy.setJurisdiction(alice, BD);

        vm.expectEmit(true, true, false, true, address(policy));
        emit JurisdictionAllowanceUpdated(BD, true, officer);
        policy.setJurisdictionAllowed(BD, true);
        policy.setJurisdictionCheckEnabled(true);
        vm.stopPrank();

        assertTrue(policy.isAllowed(alice));
    }

    /// @dev Proves an address with no recorded code is denied while the check is on.
    ///      "Unknown" must fail closed; the alternative is that forgetting to record
    ///      a code grants access.
    function test_UnknownJurisdictionIsDeniedWhenCheckOn() public {
        vm.startPrank(officer);
        policy.setJurisdictionAllowed(US, true);
        policy.setJurisdictionCheckEnabled(true);
        vm.stopPrank();

        assertEq(policy.jurisdictionOf(alice), 0);
        assertFalse(policy.isAllowed(alice));
    }

    /// @dev Proves code zero can never be added to the allow table. If it could, every
    ///      unrecorded address would pass at once, which is a silent global bypass.
    function test_RevertWhen_UnknownJurisdictionIsAllowed() public {
        vm.expectRevert(CompliancePolicy.InvalidJurisdictionCode.selector);
        vm.prank(officer);
        policy.setJurisdictionAllowed(0, true);
    }

    /// @dev Proves a stranger cannot rewrite jurisdiction policy. Jurisdiction rules
    ///      are the most politically sensitive settings in the contract.
    function test_RevertWhen_NonComplianceSetsJurisdiction() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                bob,
                policy.COMPLIANCE_ROLE()
            )
        );
        vm.prank(bob);
        policy.setJurisdiction(alice, US);
    }

    /// @dev Proves a block outranks an allowed jurisdiction too. There must be no
    ///      combination of switches that lets a blocked address back in.
    function test_BlockedWinsOverAllowedJurisdiction() public {
        vm.startPrank(officer);
        policy.setJurisdiction(alice, US);
        policy.setJurisdictionAllowed(US, true);
        policy.setJurisdictionCheckEnabled(true);
        policy.setBlocked(alice, true);
        vm.stopPrank();

        assertFalse(policy.isAllowed(alice));
    }

    // ---------------------------------------------------------------------
    // Fuzz
    // ---------------------------------------------------------------------

    /// @dev Proves a blocked address is denied for any address that is not zero,
    ///      whatever the other switches say. Catches an ordering regression that a
    ///      handful of hand-picked actors would miss.
    function testFuzz_BlockedIsAlwaysDenied(address account, bool allowlistOn, bool jurisdictionOn)
        public
    {
        vm.assume(account != address(0));

        vm.startPrank(officer);
        policy.setBlocked(account, true);
        if (allowlistOn) policy.setAllowlistEnabled(true);
        if (jurisdictionOn) policy.setJurisdictionCheckEnabled(true);
        vm.stopPrank();

        assertFalse(policy.isAllowed(account));
    }

    /// @dev Proves that with allowlist mode on and no block, the predicate is exactly
    ///      the allowlist entry. The two must never disagree, or the UI and the
    ///      controller would enforce different rules.
    function testFuzz_AllowlistModeMatchesTheList(address account, bool listed) public {
        vm.assume(account != address(0));

        vm.startPrank(officer);
        policy.setAllowlistEnabled(true);
        if (listed) policy.setAllowlisted(account, true);
        vm.stopPrank();

        assertEq(policy.isAllowed(account), listed);
    }

    /// @dev Proves a recorded jurisdiction is allowed exactly when its code is in the
    ///      allow table, for any code and any allowed flag. Catches a lookup that
    ///      reads the wrong mapping.
    function testFuzz_JurisdictionCheckFollowsTheTable(uint16 code, bool allowed) public {
        vm.assume(code != 0);

        vm.startPrank(officer);
        policy.setJurisdiction(alice, code);
        // The table defaults to false, so only a true entry needs a write; writing
        // false over false would revert with NoChange, which is the intended guard.
        if (allowed) policy.setJurisdictionAllowed(code, true);
        policy.setJurisdictionCheckEnabled(true);
        vm.stopPrank();

        assertEq(policy.isAllowed(alice), allowed);
    }
}
