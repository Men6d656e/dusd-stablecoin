import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CompliancePolicy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const compliancePolicyAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'admin', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'COMPLIANCE_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'allowlistEnabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isAllowed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isAllowlisted',
    outputs: [{ name: 'listed', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isBlocked',
    outputs: [{ name: 'blocked', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    name: 'jurisdictionAllowed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'jurisdictionCheckEnabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'jurisdictionOf',
    outputs: [{ name: 'code', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool' }],
    name: 'setAllowlistEnabled',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'setAllowlisted',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'blocked', internalType: 'bool', type: 'bool' },
    ],
    name: 'setBlocked',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'code', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setJurisdiction',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'code', internalType: 'uint16', type: 'uint16' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'setJurisdictionAllowed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool' }],
    name: 'setJurisdictionCheckEnabled',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'enabled', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AllowlistModeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AllowlistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'blocked', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BlocklistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jurisdictionCode',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
      { name: 'allowed', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'JurisdictionAllowanceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'enabled', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'JurisdictionCheckUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'jurisdictionCode',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'JurisdictionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'InvalidJurisdictionCode' },
  { type: 'error', inputs: [], name: 'NoChange' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

export const compliancePolicyAddress =
  '0x61994d53cadf2cD8786E4ea84Dc497d1ccC755F5' as const

export const compliancePolicyConfig = {
  address: compliancePolicyAddress,
  abi: compliancePolicyAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MintRedeemController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mintRedeemControllerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'compliance_',
        internalType: 'contract ICompliance',
        type: 'address',
      },
      { name: 'dusd_', internalType: 'contract dUSD', type: 'address' },
      {
        name: 'vault_',
        internalType: 'contract ReserveVault',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'COMPLIANCE',
    outputs: [
      { name: '', internalType: 'contract ICompliance', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DUSD',
    outputs: [{ name: '', internalType: 'contract dUSD', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SCALE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VAULT',
    outputs: [
      { name: '', internalType: 'contract ReserveVault', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'dusdAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'redeem',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collateralAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'dusdAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'dusdAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'collateralAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Redeemed',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'NotCompliant',
  },
  {
    type: 'error',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'scale', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'NotMultipleOfScale',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

export const mintRedeemControllerAddress =
  '0xDc042BA286F204231A7aa7bc1eC1208aB03D65C2' as const

export const mintRedeemControllerConfig = {
  address: mintRedeemControllerAddress,
  abi: mintRedeemControllerAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockUSDC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockUsdcAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

export const mockUsdcAddress =
  '0xd5687e74B3c26aA25c2a5985E2Ff974A99Fd563C' as const

export const mockUsdcConfig = {
  address: mockUsdcAddress,
  abi: mockUsdcAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReserveVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reserveVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'collateral_', internalType: 'contract IERC20', type: 'address' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'collateral',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'controller',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'deposits',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'releaseTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newController', internalType: 'address', type: 'address' },
    ],
    name: 'setController',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'surplus',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousController',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newController',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ControllerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Released',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientDeposit',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'NotController',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

export const reserveVaultAddress =
  '0x0d065884ce8D542510bF6b99B6Da8055e39f3dF5' as const

export const reserveVaultConfig = {
  address: reserveVaultAddress,
  abi: reserveVaultAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenFaucet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenFaucetAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'compliance_',
        internalType: 'contract ICompliance',
        type: 'address',
      },
      { name: 'musdc_', internalType: 'contract MockUSDC', type: 'address' },
      { name: 'amount_', internalType: 'uint256', type: 'uint256' },
      { name: 'cooldown_', internalType: 'uint256', type: 'uint256' },
      { name: 'cap_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'AMOUNT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CAP',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'COMPLIANCE',
    outputs: [
      { name: '', internalType: 'contract ICompliance', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'COOLDOWN',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MUSDC',
    outputs: [{ name: '', internalType: 'contract MockUSDC', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'canClaim',
    outputs: [{ name: 'allowed', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'claimed',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'lastClaim',
    outputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'nextClaimAt',
    outputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'claimedTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'nextClaimAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'error',
    inputs: [
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'CapBelowAmount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'claimedAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'cap', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'CapExceeded',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'availableAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'CooldownActive',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'NotCompliant',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
  { type: 'error', inputs: [], name: 'ZeroCooldown' },
] as const

export const tokenFaucetAddress =
  '0xa10D4D20d9B856f2B8e4152C3e0d1802ADdc06cD' as const

export const tokenFaucetConfig = {
  address: tokenFaucetAddress,
  abi: tokenFaucetAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dUSD
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dUsdAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      {
        name: 'compliance',
        internalType: 'contract ICompliance',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'COMPLIANCE',
    outputs: [
      { name: '', internalType: 'contract ICompliance', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'TransferNotCompliant',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

export const dUsdAddress = '0x530d583c44E44cc07154741f4D4B4cc9500bfa43' as const

export const dUsdConfig = { address: dUsdAddress, abi: dUsdAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__
 */
export const useReadCompliancePolicy = /*#__PURE__*/ createUseReadContract({
  abi: compliancePolicyAbi,
  address: compliancePolicyAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"COMPLIANCE_ROLE"`
 */
export const useReadCompliancePolicyComplianceRole =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'COMPLIANCE_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadCompliancePolicyDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"allowlistEnabled"`
 */
export const useReadCompliancePolicyAllowlistEnabled =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'allowlistEnabled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadCompliancePolicyGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadCompliancePolicyHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"isAllowed"`
 */
export const useReadCompliancePolicyIsAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'isAllowed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"isAllowlisted"`
 */
export const useReadCompliancePolicyIsAllowlisted =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'isAllowlisted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"isBlocked"`
 */
export const useReadCompliancePolicyIsBlocked =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'isBlocked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"jurisdictionAllowed"`
 */
export const useReadCompliancePolicyJurisdictionAllowed =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'jurisdictionAllowed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"jurisdictionCheckEnabled"`
 */
export const useReadCompliancePolicyJurisdictionCheckEnabled =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'jurisdictionCheckEnabled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"jurisdictionOf"`
 */
export const useReadCompliancePolicyJurisdictionOf =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'jurisdictionOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadCompliancePolicySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__
 */
export const useWriteCompliancePolicy = /*#__PURE__*/ createUseWriteContract({
  abi: compliancePolicyAbi,
  address: compliancePolicyAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteCompliancePolicyGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteCompliancePolicyRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteCompliancePolicyRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setAllowlistEnabled"`
 */
export const useWriteCompliancePolicySetAllowlistEnabled =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setAllowlistEnabled',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setAllowlisted"`
 */
export const useWriteCompliancePolicySetAllowlisted =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setAllowlisted',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setBlocked"`
 */
export const useWriteCompliancePolicySetBlocked =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setBlocked',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdiction"`
 */
export const useWriteCompliancePolicySetJurisdiction =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdiction',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdictionAllowed"`
 */
export const useWriteCompliancePolicySetJurisdictionAllowed =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdictionAllowed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdictionCheckEnabled"`
 */
export const useWriteCompliancePolicySetJurisdictionCheckEnabled =
  /*#__PURE__*/ createUseWriteContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdictionCheckEnabled',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__
 */
export const useSimulateCompliancePolicy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateCompliancePolicyGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateCompliancePolicyRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateCompliancePolicyRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setAllowlistEnabled"`
 */
export const useSimulateCompliancePolicySetAllowlistEnabled =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setAllowlistEnabled',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setAllowlisted"`
 */
export const useSimulateCompliancePolicySetAllowlisted =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setAllowlisted',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setBlocked"`
 */
export const useSimulateCompliancePolicySetBlocked =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setBlocked',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdiction"`
 */
export const useSimulateCompliancePolicySetJurisdiction =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdiction',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdictionAllowed"`
 */
export const useSimulateCompliancePolicySetJurisdictionAllowed =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdictionAllowed',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link compliancePolicyAbi}__ and `functionName` set to `"setJurisdictionCheckEnabled"`
 */
export const useSimulateCompliancePolicySetJurisdictionCheckEnabled =
  /*#__PURE__*/ createUseSimulateContract({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    functionName: 'setJurisdictionCheckEnabled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__
 */
export const useWatchCompliancePolicyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"AllowlistModeUpdated"`
 */
export const useWatchCompliancePolicyAllowlistModeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'AllowlistModeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"AllowlistUpdated"`
 */
export const useWatchCompliancePolicyAllowlistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'AllowlistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"BlocklistUpdated"`
 */
export const useWatchCompliancePolicyBlocklistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'BlocklistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"JurisdictionAllowanceUpdated"`
 */
export const useWatchCompliancePolicyJurisdictionAllowanceUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'JurisdictionAllowanceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"JurisdictionCheckUpdated"`
 */
export const useWatchCompliancePolicyJurisdictionCheckUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'JurisdictionCheckUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"JurisdictionUpdated"`
 */
export const useWatchCompliancePolicyJurisdictionUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'JurisdictionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchCompliancePolicyRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchCompliancePolicyRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link compliancePolicyAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchCompliancePolicyRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: compliancePolicyAbi,
    address: compliancePolicyAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__
 */
export const useReadMintRedeemController = /*#__PURE__*/ createUseReadContract({
  abi: mintRedeemControllerAbi,
  address: mintRedeemControllerAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"COMPLIANCE"`
 */
export const useReadMintRedeemControllerCompliance =
  /*#__PURE__*/ createUseReadContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'COMPLIANCE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"DUSD"`
 */
export const useReadMintRedeemControllerDusd =
  /*#__PURE__*/ createUseReadContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'DUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"SCALE"`
 */
export const useReadMintRedeemControllerScale =
  /*#__PURE__*/ createUseReadContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'SCALE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"VAULT"`
 */
export const useReadMintRedeemControllerVault =
  /*#__PURE__*/ createUseReadContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'VAULT',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__
 */
export const useWriteMintRedeemController =
  /*#__PURE__*/ createUseWriteContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteMintRedeemControllerMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"redeem"`
 */
export const useWriteMintRedeemControllerRedeem =
  /*#__PURE__*/ createUseWriteContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'redeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__
 */
export const useSimulateMintRedeemController =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateMintRedeemControllerMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `functionName` set to `"redeem"`
 */
export const useSimulateMintRedeemControllerRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    functionName: 'redeem',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mintRedeemControllerAbi}__
 */
export const useWatchMintRedeemControllerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `eventName` set to `"Minted"`
 */
export const useWatchMintRedeemControllerMintedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    eventName: 'Minted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mintRedeemControllerAbi}__ and `eventName` set to `"Redeemed"`
 */
export const useWatchMintRedeemControllerRedeemedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mintRedeemControllerAbi,
    address: mintRedeemControllerAddress,
    eventName: 'Redeemed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__
 */
export const useReadMockUsdc = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadMockUsdcAllowance = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadMockUsdcBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadMockUsdcDecimals = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"name"`
 */
export const useReadMockUsdcName = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMockUsdcOwner = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadMockUsdcSymbol = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadMockUsdcTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__
 */
export const useWriteMockUsdc = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteMockUsdcApprove = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteMockUsdcMint = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMockUsdcRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteMockUsdcTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteMockUsdcTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMockUsdcTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__
 */
export const useSimulateMockUsdc = /*#__PURE__*/ createUseSimulateContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateMockUsdcApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateMockUsdcMint = /*#__PURE__*/ createUseSimulateContract({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMockUsdcRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateMockUsdcTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateMockUsdcTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdcAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMockUsdcTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdcAbi}__
 */
export const useWatchMockUsdcEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: mockUsdcAbi,
  address: mockUsdcAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdcAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchMockUsdcApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdcAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMockUsdcOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdcAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchMockUsdcTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdcAbi,
    address: mockUsdcAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__
 */
export const useReadReserveVault = /*#__PURE__*/ createUseReadContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"collateral"`
 */
export const useReadReserveVaultCollateral =
  /*#__PURE__*/ createUseReadContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'collateral',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"controller"`
 */
export const useReadReserveVaultController =
  /*#__PURE__*/ createUseReadContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'controller',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"deposits"`
 */
export const useReadReserveVaultDeposits = /*#__PURE__*/ createUseReadContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
  functionName: 'deposits',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadReserveVaultOwner = /*#__PURE__*/ createUseReadContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"surplus"`
 */
export const useReadReserveVaultSurplus = /*#__PURE__*/ createUseReadContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
  functionName: 'surplus',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"totalAssets"`
 */
export const useReadReserveVaultTotalAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'totalAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"totalDeposits"`
 */
export const useReadReserveVaultTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'totalDeposits',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__
 */
export const useWriteReserveVault = /*#__PURE__*/ createUseWriteContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"depositFor"`
 */
export const useWriteReserveVaultDepositFor =
  /*#__PURE__*/ createUseWriteContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'depositFor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"releaseTo"`
 */
export const useWriteReserveVaultReleaseTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'releaseTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteReserveVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"setController"`
 */
export const useWriteReserveVaultSetController =
  /*#__PURE__*/ createUseWriteContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'setController',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteReserveVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__
 */
export const useSimulateReserveVault = /*#__PURE__*/ createUseSimulateContract({
  abi: reserveVaultAbi,
  address: reserveVaultAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"depositFor"`
 */
export const useSimulateReserveVaultDepositFor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'depositFor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"releaseTo"`
 */
export const useSimulateReserveVaultReleaseTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'releaseTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateReserveVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"setController"`
 */
export const useSimulateReserveVaultSetController =
  /*#__PURE__*/ createUseSimulateContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'setController',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link reserveVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateReserveVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link reserveVaultAbi}__
 */
export const useWatchReserveVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link reserveVaultAbi}__ and `eventName` set to `"ControllerUpdated"`
 */
export const useWatchReserveVaultControllerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    eventName: 'ControllerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link reserveVaultAbi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchReserveVaultDepositedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    eventName: 'Deposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link reserveVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchReserveVaultOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link reserveVaultAbi}__ and `eventName` set to `"Released"`
 */
export const useWatchReserveVaultReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: reserveVaultAbi,
    address: reserveVaultAddress,
    eventName: 'Released',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__
 */
export const useReadTokenFaucet = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"AMOUNT"`
 */
export const useReadTokenFaucetAmount = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'AMOUNT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"CAP"`
 */
export const useReadTokenFaucetCap = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'CAP',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"COMPLIANCE"`
 */
export const useReadTokenFaucetCompliance = /*#__PURE__*/ createUseReadContract(
  {
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
    functionName: 'COMPLIANCE',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"COOLDOWN"`
 */
export const useReadTokenFaucetCooldown = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'COOLDOWN',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"MUSDC"`
 */
export const useReadTokenFaucetMusdc = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'MUSDC',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"canClaim"`
 */
export const useReadTokenFaucetCanClaim = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'canClaim',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"claimed"`
 */
export const useReadTokenFaucetClaimed = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'claimed',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"lastClaim"`
 */
export const useReadTokenFaucetLastClaim = /*#__PURE__*/ createUseReadContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'lastClaim',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"nextClaimAt"`
 */
export const useReadTokenFaucetNextClaimAt =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
    functionName: 'nextClaimAt',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenFaucetAbi}__
 */
export const useWriteTokenFaucet = /*#__PURE__*/ createUseWriteContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"claim"`
 */
export const useWriteTokenFaucetClaim = /*#__PURE__*/ createUseWriteContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
  functionName: 'claim',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenFaucetAbi}__
 */
export const useSimulateTokenFaucet = /*#__PURE__*/ createUseSimulateContract({
  abi: tokenFaucetAbi,
  address: tokenFaucetAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenFaucetAbi}__ and `functionName` set to `"claim"`
 */
export const useSimulateTokenFaucetClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
    functionName: 'claim',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenFaucetAbi}__
 */
export const useWatchTokenFaucetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenFaucetAbi}__ and `eventName` set to `"Claimed"`
 */
export const useWatchTokenFaucetClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenFaucetAbi,
    address: tokenFaucetAddress,
    eventName: 'Claimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__
 */
export const useReadDUsd = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"COMPLIANCE"`
 */
export const useReadDUsdCompliance = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'COMPLIANCE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadDUsdDefaultAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'DEFAULT_ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"MINTER_ROLE"`
 */
export const useReadDUsdMinterRole = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'MINTER_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadDUsdPauserRole = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'PAUSER_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadDUsdAllowance = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadDUsdBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadDUsdDecimals = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadDUsdGetRoleAdmin = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadDUsdHasRole = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"name"`
 */
export const useReadDUsdName = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"paused"`
 */
export const useReadDUsdPaused = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadDUsdSupportsInterface = /*#__PURE__*/ createUseReadContract(
  { abi: dUsdAbi, address: dUsdAddress, functionName: 'supportsInterface' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadDUsdSymbol = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadDUsdTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__
 */
export const useWriteDUsd = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteDUsdApprove = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteDUsdBurn = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useWriteDUsdBurnFrom = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'burnFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteDUsdGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteDUsdMint = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteDUsdPause = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteDUsdRenounceRole = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteDUsdRevokeRole = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteDUsdTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteDUsdTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteDUsdUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__
 */
export const useSimulateDUsd = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateDUsdApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateDUsdBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useSimulateDUsdBurnFrom = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'burnFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateDUsdGrantRole = /*#__PURE__*/ createUseSimulateContract(
  { abi: dUsdAbi, address: dUsdAddress, functionName: 'grantRole' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateDUsdMint = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateDUsdPause = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateDUsdRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dUsdAbi,
    address: dUsdAddress,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateDUsdRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dUsdAbi,
    address: dUsdAddress,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateDUsdTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateDUsdTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dUsdAbi,
    address: dUsdAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dUsdAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateDUsdUnpause = /*#__PURE__*/ createUseSimulateContract({
  abi: dUsdAbi,
  address: dUsdAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__
 */
export const useWatchDUsdEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: dUsdAbi,
  address: dUsdAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchDUsdApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchDUsdPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchDUsdRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchDUsdRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchDUsdRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchDUsdTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dUsdAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchDUsdUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dUsdAbi,
    address: dUsdAddress,
    eventName: 'Unpaused',
  })
