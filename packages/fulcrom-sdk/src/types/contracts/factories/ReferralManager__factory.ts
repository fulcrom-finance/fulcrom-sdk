/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
 

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ReferralManager,
  ReferralManagerInterface,
} from "../ReferralManager";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "AffiliateRewardClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "code",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "traderDiscountAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "affiliateRewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
    ],
    name: "ReferralDiscount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "code",
        type: "bytes32",
      },
    ],
    name: "RegisterCode",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "code",
        type: "bytes32",
      },
    ],
    name: "RemoveTraderReferralCode",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "SetAffiliateTier",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRebate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "discountShare",
        type: "uint256",
      },
    ],
    name: "SetTier",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "code",
        type: "bytes32",
      },
    ],
    name: "SetTraderReferralCode",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BASIS_POINTS_DIVISOR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "HANDLER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "KEEPER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "affiliateRewards",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "affiliateTiers",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimAffiliateReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "codeOwners",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_trader",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_positionFeeUsd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_sizeDelta",
        type: "uint256",
      },
    ],
    name: "discountPositionFee",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "feeForPoolAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "feeForPoolUsd",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rebateAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rebateUsd",
            type: "uint256",
          },
        ],
        internalType: "struct ReferralPositionFee",
        name: "fee",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "feeFlpTracker",
    outputs: [
      {
        internalType: "contract IRewardTracker",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "flpThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_affiliate",
        type: "address",
      },
    ],
    name: "getAffiliateReward",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_affiliate",
        type: "address",
      },
    ],
    name: "getReferralInfoByAffiliate",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "code",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "affiliate",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "rebate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "discount",
                type: "uint256",
              },
            ],
            internalType: "struct Tier",
            name: "tier",
            type: "tuple",
          },
        ],
        internalType: "struct ReferralInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_code",
        type: "bytes32",
      },
    ],
    name: "getReferralInfoByCode",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "code",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "affiliate",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "rebate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "discount",
                type: "uint256",
              },
            ],
            internalType: "struct Tier",
            name: "tier",
            type: "tuple",
          },
        ],
        internalType: "struct ReferralInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_trader",
        type: "address",
      },
    ],
    name: "getReferralInfoByTrader",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "code",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "affiliate",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "rebate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "discount",
                type: "uint256",
              },
            ],
            internalType: "struct Tier",
            name: "tier",
            type: "tuple",
          },
        ],
        internalType: "struct ReferralInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IVault",
        name: "_vault",
        type: "address",
      },
      {
        internalType: "contract IRewardTracker",
        name: "_feeFlpTracker",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "ownerCodes",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "registerAffiliate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_affiliate",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_code",
        type: "bytes32",
      },
    ],
    name: "registerAffiliateByAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "removeTraderReferralCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_affiliate",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tierId",
        type: "uint256",
      },
    ],
    name: "setAffiliateTier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newThreshold",
        type: "uint256",
      },
    ],
    name: "setFlpThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tierId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_rebate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_discount",
        type: "uint256",
      },
    ],
    name: "setTier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_trader",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_code",
        type: "bytes32",
      },
    ],
    name: "setTraderReferralCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_code",
        type: "bytes32",
      },
    ],
    name: "setTraderReferralCodeByUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tiers",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rebate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "discount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "traderReferralCodes",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newAdmin",
        type: "address",
      },
    ],
    name: "transferAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vault",
    outputs: [
      {
        internalType: "contract IVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class ReferralManager__factory {
  static readonly abi = _abi;
  static createInterface(): ReferralManagerInterface {
    return new utils.Interface(_abi) as ReferralManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReferralManager {
    return new Contract(address, _abi, signerOrProvider) as ReferralManager;
  }
}
