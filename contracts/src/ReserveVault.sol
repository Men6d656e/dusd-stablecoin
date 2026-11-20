// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ReserveVault
/// @author Men6d656e
/// @notice Custody ledger for the mUSDC collateral that backs dUSD.
/// @dev The vault never decides who may mint or redeem. The controller (added in a
///      later build step) calls {depositFor} after a user deposits, and {releaseTo}
///      before the controller burns dUSD. Collateral is an immutable address, so the
///      vault can never be repointed at a different token.
///
///      Invariant: totalAssets() >= totalDeposits, and
///      sum of deposits[account] over all accounts == totalDeposits.
///      Direct transfers into the vault increase totalAssets but not totalDeposits;
///      that difference is reported by {surplus}.
contract ReserveVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev The collateral token held by this vault (mUSDC, 6 decimals).
    IERC20 private immutable COLLATERAL;

    /// @notice Address allowed to call {depositFor} and {releaseTo}.
    address public controller;

    /// @notice Sum of every account's recorded deposit, in collateral base units.
    uint256 public totalDeposits;

    /// @notice Recorded collateral owned by each account, in collateral base units.
    mapping(address account => uint256 amount) public deposits;

    error ZeroAddress();
    error ZeroAmount();
    error NotController(address caller);
    error InsufficientDeposit(address account, uint256 available, uint256 requested);

    event ControllerUpdated(address indexed previousController, address indexed newController);
    event Deposited(address indexed account, uint256 amount);
    event Released(address indexed account, uint256 amount);

    /// @notice Deploys the vault for one collateral token.
    /// @param collateral_ Token held as reserves; cannot be changed later.
    /// @param initialOwner Account allowed to set the controller.
    constructor(IERC20 collateral_, address initialOwner) Ownable(initialOwner) {
        if (address(collateral_) == address(0)) revert ZeroAddress();
        COLLATERAL = collateral_;
    }

    modifier onlyController() {
        _checkController();
        _;
    }

    /// @notice Sets the only address allowed to move recorded collateral.
    /// @dev Starts as address(0), so the vault is inert until the owner wires it.
    /// @param newController Controller contract address (never the zero address).
    function setController(address newController) external onlyOwner {
        if (newController == address(0)) revert ZeroAddress();
        address previous = controller;
        controller = newController;
        emit ControllerUpdated(previous, newController);
    }

    /// @notice The collateral token this vault holds.
    function collateral() external view returns (IERC20) {
        return COLLATERAL;
    }

    /// @notice Total collateral actually held by the vault.
    /// @dev Reads the token balance, so donations are included. This is the number
    ///      the reserve ratio and proof-of-reserves page must use.
    function totalAssets() public view returns (uint256) {
        return COLLATERAL.balanceOf(address(this));
    }

    /// @notice Collateral held by the vault that is not credited to any account.
    /// @dev Donations and rounding leftovers land here. Reverts if accounting is
    ///      ever broken, which is the desired loud failure.
    function surplus() external view returns (uint256) {
        return totalAssets() - totalDeposits;
    }

    function _checkController() internal view {
        if (msg.sender != controller) revert NotController(msg.sender);
    }

    /// @notice Pulls `amount` collateral from `account` into the vault and credits them.
    /// @dev The user must approve THIS vault, not the controller. The controller only
    ///      triggers the pull, so a malicious controller cannot move more than the
    ///      user approved, and the credit always goes to the payer.
    /// @param account User whose collateral is pulled and credited.
    /// @param amount Amount in collateral base units (1 mUSDC = 1_000_000).
    function depositFor(address account, uint256 amount) external onlyController nonReentrant {
        if (account == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        COLLATERAL.safeTransferFrom(account, address(this), amount);

        deposits[account] += amount;
        totalDeposits += amount;

        emit Deposited(account, amount);
    }

    /// @notice Sends `amount` collateral back to `account` and removes the credit.
    /// @dev The controller must burn the matching dUSD in the same transaction;
    ///      that pairing is enforced by the controller, not by the vault.
    /// @param account User receiving the collateral.
    /// @param amount Amount in collateral base units.
    function releaseTo(address account, uint256 amount) external onlyController nonReentrant {
        if (account == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 available = deposits[account];
        if (available < amount) revert InsufficientDeposit(account, available, amount);

        deposits[account] = available - amount;
        totalDeposits -= amount;

        COLLATERAL.safeTransfer(account, amount);

        emit Released(account, amount);
    }
}
