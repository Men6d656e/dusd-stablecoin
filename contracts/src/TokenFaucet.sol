// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ICompliance } from "./interfaces/ICompliance.sol";
import { MockUSDC } from "./MockUSDC.sol";

/// @title TokenFaucet
/// @author Men6d656e
/// @notice Demo on-ramp for the dUSD system: gives a fixed amount of mUSDC to a
///         compliant address, once per cooldown, up to a lifetime cap.
/// @dev The faucet mints mUSDC, never dUSD. It is the demo collateral source, not
///      the money path: a wallet claims mUSDC here, then mints dUSD through the
///      {MintRedeemController}. It holds no funds, has no admin role and no pause.
///
///      The abuse controls are the two immutable values every claim is measured
///      against:
///      - {COOLDOWN} is the minimum time between two claims by the same address;
///      - {CAP} is the lifetime maximum per address. Because every claim is the
///        fixed {AMOUNT}, the cap is rounded down to whole claims: amount 10 with
///        cap 25 gives two claims (20), and the remaining 5 is never claimable.
///
///      Compliance is the first check, before the cooldown and before the mint, so
///      a blocked address cannot fund itself even if it has never claimed. The
///      faucet asks the same {ICompliance} policy as the controller.
///
///      The faucet can mint only because it is the owner of {MockUSDC}. That one
///      wiring transaction happens after deploy and is printed by the deploy script.
contract TokenFaucet is ReentrancyGuard {
    /// @notice The 6-decimal demo collateral this faucet mints.
    MockUSDC public immutable MUSDC;

    /// @notice The compliance policy consulted before every claim.
    ICompliance public immutable COMPLIANCE;

    /// @notice mUSDC minted per claim, in 6-decimal base units.
    uint256 public immutable AMOUNT;

    /// @notice Minimum seconds between two claims by the same address.
    uint256 public immutable COOLDOWN;

    /// @notice Lifetime maximum mUSDC per address, in 6-decimal base units.
    uint256 public immutable CAP;

    /// @notice Timestamp of the last successful claim per address; zero means never.
    mapping(address account => uint256 timestamp) public lastClaim;

    /// @notice Total mUSDC claimed per address, in 6-decimal base units.
    mapping(address account => uint256 amount) public claimed;

    /// @notice Thrown when a constructor argument that must be an address is zero.
    error ZeroAddress();

    /// @notice Thrown when the per-claim amount is zero.
    error ZeroAmount();

    /// @notice Thrown when the cooldown is zero.
    /// @dev A zero cooldown would let one address take the whole cap at once.
    error ZeroCooldown();

    /// @notice Thrown when the cap is smaller than a single claim.
    /// @dev A cap below the amount means no address could ever claim anything.
    error CapBelowAmount(uint256 cap, uint256 amount);

    /// @notice Thrown when `account` is not allowed by the compliance policy.
    error NotCompliant(address account);

    /// @notice Thrown when `account` claims before its cooldown has elapsed.
    error CooldownActive(address account, uint256 availableAt);

    /// @notice Thrown when a claim would push `account` past the lifetime cap.
    error CapExceeded(address account, uint256 claimedAmount, uint256 cap);

    /// @notice Emitted after a successful claim.
    /// @param account Recipient of the minted mUSDC.
    /// @param amount Amount minted, in 6-decimal base units.
    /// @param claimedTotal Lifetime total claimed by `account` after this claim.
    /// @param nextClaimAt Earliest timestamp of the next claim by `account`.
    event Claimed(
        address indexed account, uint256 amount, uint256 claimedTotal, uint256 nextClaimAt
    );

    /// @notice Wires the token, policy and abuse controls together.
    /// @dev All five values are immutable: changing the demo economics means
    ///      redeploying the faucet, which is visible and cheap. After deploy the
    ///      mUSDC owner must call {MockUSDC.transferOwnership} with this address,
    ///      otherwise every claim reverts with `OwnableUnauthorizedAccount`.
    /// @param compliance_ Policy asked before every claim.
    /// @param musdc_ Token minted by every claim; this faucet must own it.
    /// @param amount_ mUSDC per claim, in 6-decimal base units.
    /// @param cooldown_ Minimum seconds between claims; must not be zero.
    /// @param cap_ Lifetime maximum per address; must be at least `amount_`.
    constructor(
        ICompliance compliance_,
        MockUSDC musdc_,
        uint256 amount_,
        uint256 cooldown_,
        uint256 cap_
    ) {
        if (address(compliance_) == address(0) || address(musdc_) == address(0)) {
            revert ZeroAddress();
        }
        if (amount_ == 0) revert ZeroAmount();
        if (cooldown_ == 0) revert ZeroCooldown();
        if (cap_ < amount_) revert CapBelowAmount(cap_, amount_);

        COMPLIANCE = compliance_;
        MUSDC = musdc_;
        AMOUNT = amount_;
        COOLDOWN = cooldown_;
        CAP = cap_;
    }

    /// @notice Mints {AMOUNT} mUSDC to the caller if compliant, off cooldown and
    ///         under the lifetime cap.
    /// @dev Order is the safety property: compliance first, then cooldown, then cap,
    ///      then state writes, then the external mint. State is written before the
    ///      mint call (checks-effects-interactions), so a reentrant token could not
    ///      claim twice in one transaction even without {nonReentrant}.
    function claim() external nonReentrant {
        if (!COMPLIANCE.isAllowed(msg.sender)) revert NotCompliant(msg.sender);

        uint256 last = lastClaim[msg.sender];
        if (last != 0 && block.timestamp < last + COOLDOWN) {
            revert CooldownActive(msg.sender, last + COOLDOWN);
        }

        uint256 newTotal = claimed[msg.sender] + AMOUNT;
        if (newTotal > CAP) revert CapExceeded(msg.sender, claimed[msg.sender], CAP);

        lastClaim[msg.sender] = block.timestamp;
        claimed[msg.sender] = newTotal;

        MUSDC.mint(msg.sender, AMOUNT);

        emit Claimed(msg.sender, AMOUNT, newTotal, block.timestamp + COOLDOWN);
    }

    /// @notice Earliest timestamp at which `account` may claim again.
    /// @dev Returns zero when the account has never claimed, which reads naturally
    ///      as "no cooldown is running yet".
    /// @param account Address being read.
    /// @return timestamp Unix timestamp, or zero before the first claim.
    function nextClaimAt(address account) external view returns (uint256 timestamp) {
        uint256 last = lastClaim[account];
        if (last == 0) return 0;
        return last + COOLDOWN;
    }

    /// @notice Whether `account` would succeed if it called {claim} now.
    /// @dev A read-only preview of the same three checks, useful for a frontend
    ///      button state. It never changes state and never mints.
    /// @param account Address being checked.
    /// @return allowed True when compliance, cooldown and cap all pass.
    function canClaim(address account) external view returns (bool allowed) {
        if (!COMPLIANCE.isAllowed(account)) return false;
        if (claimed[account] + AMOUNT > CAP) return false;

        uint256 last = lastClaim[account];
        return last == 0 || block.timestamp >= last + COOLDOWN;
    }
}
