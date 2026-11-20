// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @author Men6d656e
/// @notice Minimal 6-decimal ERC-20 that stands in for USDC in the dUSD demo.
/// @dev Testnet-only demo collateral. This is not real USDC and holds no value.
///      The owner can mint without a cap, so this contract must never be deployed
///      to a network where its balances mean something.
contract MockUSDC is ERC20, Ownable {
    /// @dev USDC uses 6 decimals; matching it keeps demo amounts realistic and
    ///      surfaces 1e6-vs-1e18 scaling mistakes early.
    uint8 private constant DECIMALS = 6;

    /// @notice Deploys the mock token and sets the account allowed to mint.
    /// @param initialOwner Address that receives minting rights (deployer or treasury).
    constructor(address initialOwner) ERC20("Mock USD Coin", "mUSDC") Ownable(initialOwner) { }

    /// @inheritdoc ERC20
    /// @dev Overrides the 18-decimal default. All amounts are therefore in 1e6 units.
    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }

    /// @notice Mints `amount` mock USDC to `to`.
    /// @dev Restricted to the owner. `_mint` performs the zero-address check and
    ///      emits {Transfer} from the zero address, so no extra event is needed.
    /// @param to Recipient of the minted collateral.
    /// @param amount Amount in 6-decimal units (1 mUSDC = 1_000_000).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
