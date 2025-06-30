 

import { AddressZero } from "@ethersproject/constants";
import { ChainId, ChainName } from "../types";

export const CHAIN_NAMES = [ChainName.CRONOS] as const;

export type ContractName = keyof AddressMap;
export const indexTokens = [
  "BTC",
  "ETH",
  "WETH",
  "USDC", // bridged
  "USDC.native", // native
  "USDT",
  "ATOM",
  "ADA",
  "XRP",
  "LTC",
  "BCH",
  "SOL",
  "PEPE",
  "DOGE",
  "SHIB",
  "ZK",
  "NEAR",
  "WIF",
  "SUI",
  "CRO",
  "WCRO",
  "UNI",
  "AAVE",
  "HBAR",
  "PENGU",
  "TRUMP",
] as const;
const platformTokens = ["FLP", "FUL", "ES_FUL"] as const;

const nativeTokensByChain = {
  [ChainName.CRONOS]: "CRO" as const,
} satisfies Record<ChainName, string>;

const nativeTokens = CHAIN_NAMES.map((chain) => nativeTokensByChain[chain]);
export const tokens = Array.from(
  new Set([
    "BN_FUL",
    "USDG",
    "CRO",
    "zkCRO",
    "H2",
    ...nativeTokens,
    ...platformTokens,
    ...indexTokens,
  ] as const)
).sort();
export const Erc20TokenInTrade = [
  "BTC",
  "USDC", // bridged
  "USDC.native", // native
  "USDT",
  "ATOM",
  "ADA",
  "XRP",
  "LTC",
  "BCH",
  "SOL",
  "PEPE",
  "DOGE",
  "SHIB",
  "ZK",
  "NEAR",
  "WIF",
  "SUI",
  "UNI",
  "AAVE",
  "HBAR",
  "PENGU",
  "TRUMP",
] as const;
export const Erc20Tokens = [
  ...Erc20TokenInTrade,

  "WETH",
  "WCRO",
  // 'wzkCRO',
  // !! once integrate new chain , add the wrap erc token here

  "FUL",
  "ES_FUL",
  "H2",
] as const;

export type TokenSymbol = (typeof tokens)[number];
export type Erc20TokenSymbol = (typeof Erc20Tokens)[number];
export type NativeTokenSymbol = (typeof nativeTokens)[number];
export type IndexTokenSymbol = (typeof indexTokens)[number];
export type PlatformTokenSymbol = (typeof platformTokens)[number];
export type IndexTokenAddressMap = Partial<Record<IndexTokenSymbol, string>>;
export type TokenAddressMap = Partial<Record<TokenSymbol, string>>;

export type AddressMap = TokenAddressMap & {
  NATIVE_TOKEN: string;
  Vault: string;
  VaultUtils: string;
  Router: string;
  VaultReader: string;
  Reader: string;
  FlpManager: string;
  RewardRouter: string;
  RewardReader: string;

  StakedFulTracker: string;
  BonusFulTracker: string;
  FeeFulTracker: string;
  StakedFlpTracker: string;
  FeeFlpTracker: string;

  StakedFulDistributor: string;
  StakedFlpDistributor: string;

  FulVester: string;
  FlpVester: string;

  OrderBook: string;
  OrderBookReader: string;

  PositionRouter: string;
  PositionManager: string;

  CronosFulPool: string;
  CronosCroPool: string;
  CronosId: string;
  VVS_MINER_MOLE: string;

  FulVesting: string;

  Pyth: string;

  CircuitBreaker: string;

  MultiCall: string;

  ReferralManager: string;

  Timelock: string;
};

const TOKEN_ADDRESS_BY_CHAIN: {
  [key in ChainId]: TokenAddressMap;
} = {
  [ChainId.CRONOS_MAINNET]: {
    // index tokens
    BTC: "0x062e66477faf219f25d27dced647bf57c3107d52",
    ETH: "0xe44fd7fcb2b1581822d0c862b68222998a0c299a",
    USDC: "0xc21223249ca28397b4b6541dffaecc539bff0c59",
    USDT: "0x66e428c3f67a68878562e79a0234c1f83c208770",
    ATOM: "0xB888d8Dd1733d72681b30c00ee76BDE93ae7aa93",
    ADA: "0x0e517979C2c1c1522ddB0c73905e0D39b3F990c0",
    XRP: "0xb9Ce0dd29C91E02d4620F57a66700Fc5e41d6D15",
    LTC: "0x9d97Be214b68C7051215BB61059B4e299Cd792c3",
    BCH: "0x7589B70aBb83427bb7049e08ee9fC6479ccB7a23",
    SOL: "0xc9DE0F3e08162312528FF72559db82590b481800",
    PEPE: "0xf868c454784048af4f857991583e34243c92ff48",
    DOGE: "0x1a8e39ae59e5556b56b76fcba98d22c9ae557396",
    SHIB: "0xbed48612bc69fa1cab67052b42a95fb30c1bcfee",
    NEAR: "0xafe470ae215e48c144c7158eae3ccf0c451cb0cb",
    WIF: "0x25e8c72d267b96e757875d8b565a42c0e3b8f12f",
    SUI: "0x81710203A7FC16797aC9899228a87fd622df9706",
    CRO: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    WCRO: "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23",
    UNI: "0x16aD43896f7C47a5d9Ee546c44A22205738B329c",
    AAVE: "0xE657b115bc45c0786274c824f83e3e02CE809185",
    HBAR: "0xe0C7226a58f54db71eDc6289Ba2dc80349B41974",
    PENGU: "0x769409037336430A1a5890065B7853f0D1D8b58f",
    TRUMP: "0xd1D7A0Ff6Cd3d494038b7FB93dbAeF624Da6f417",

    FLP: "0xE789D5a4256bB4273dac49dC112c597a327ef92d",
    FUL: "0x83aFB1C32E5637ACd0a452D87c3249f4a9F0013A",
    ES_FUL: "0x09d7C9f284686C27A2CAFf3f2fF12e5cD3Dfe20f",
    BN_FUL: "0x2571470249273C7D4Ef5b531bEc539Cd6026Ce8B",
    USDG: "0xB09BD2bAf03e19550473a5DC1D5023805E04a4f5",
  },
  [ChainId.CRONOS_TESTNET]: {
    // index tokens
    BTC: "0xffc8ce84a196420d7bccdee980c65364ed1f389f",
    ETH: "0x441d72d584b16105ff1c68dc8bc4517f4dc13e55",
    USDC: "0x321106e51b78e0e9cebcfec63c5250f0f3ccb82b",
    USDT: "0x914a8825b29a04ae687625ecda20b67abd0b58b1",
    ATOM: "0xd9cEEB61010e3a16D8bc1A1Ea1b9960a58C1bF59",
    ADA: "0xF455f31BAA24dC183A2E9fd1D7F2cb21e1Da509a",
    XRP: "0x49FdCb02aDC9f895a8bb8ff9B564Cf485010ba24",
    LTC: "0xa5c469c0D5a55C03D5f7Db1Bfc5F1Bd68b8E5f44",
    BCH: "0x6C00F0C723F321eA5cd927080Cc9f322D7cD5C1d",
    SOL: "0x9AcBBB7728AD434d656042b1f57a69eF29Ac5257",
    PEPE: "0x07375e5ac45b874b8f18a45758761d7efc0079dc",
    DOGE: "0xb06896ef071eefc3aa0c14cd3f80c8af215a2659",
    SHIB: "0xe836ae7c64b504fd8cf9cbc92cc2bf30c7c6f1b4",
    NEAR: "0x65ff0b871fe06b3141e85aec7904cb5c66190e5f",
    WIF: "0x26395c6baf90720339d6a4b912ca8a366dac500a",
    SUI: "0x797180BA6Fef52b3F15FbEE1d96E9afFB05852F0",
    CRO: "0x6a3173618859C7cd40fAF6921b5E9eB6A76f1fD4",
    WCRO: "0x6a3173618859C7cd40fAF6921b5E9eB6A76f1fD4",
    UNI: "0x6967F78450D28c90AF8e30e51e79ee5eB6354A34",
    AAVE: "0x05FE1bfbb9AC7dE3078E5c693A153e841F62B0D2",
    HBAR: "0x7995C0fa567Ea8f30b82029A09ccb0370D0F609F",
    PENGU: "0xd4AF5Cd3d42B60774076DA3deCbE9b64C7B724Ef",
    TRUMP: "0xBfE2D0E744cCff009dF0008A9beE3eeEb8e17993",

    FLP: "0x49C04bB50D66bCa92552E9f0ee64e7b39504b77c",
    FUL: "0x2e755Bf30938B64281900d2219C3842d509e9D92",
    ES_FUL: "0xd8770264553F0dc3d9d7728e2e3BE1f065A8C36b",
    BN_FUL: "0x0c8dDD9aacA2062D9fAd5708e9e22F696aCDD5B8",
    USDG: "0x5ab1dB00780B0a727065F4E71dEe379A95FA269A",
  },
};

const ADDRESS_BY_CHAIN: {
  [key in ChainId]: AddressMap;
} = {
  [ChainId.CRONOS_MAINNET]: {
    ...TOKEN_ADDRESS_BY_CHAIN[ChainId.CRONOS_MAINNET],
    NATIVE_TOKEN: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", // WCRO
    Vault: "0x8C7Ef34aa54210c76D6d5E475f43e0c11f876098",
    VaultUtils: "0x725c5AF8bb360816C8ad2Cca020f9C63B83ABccb",
    Router: "0xcC46b79eBEaA1D834B707624977Ec261592E0C9a",
    VaultReader: "0x2C2e10eb9f3f9D33cdE957E6d5A767b4feEE1bdA",
    Reader: "0x3881df9c3115aA4a2E35C080764B5Dd8112dE177",
    FlpManager: "0x6148107BcAC794d3fC94239B88fA77634983891F",
    RewardRouter: "0x133B7f9570b3be8e51CCd5DA4654C3DDe7657Ae1",
    RewardReader: "0x2275b50e92AD58787838261F06C005EAe1F0691c",

    StakedFulTracker: "0x2a628916F85CaaF21daBa223ff2d93aA07816652",
    BonusFulTracker: "0xe006ab8c1796674786Ad8cf5937EfF1baA59fA15",
    FeeFulTracker: "0x8fbD95D76EDe5a0d7EeBea756515F1A363A7f6f7",
    StakedFlpTracker: "0x6fCFD36A7D705608146cdD7773b531301952507E",
    FeeFlpTracker: "0xd2985b8EBC2ce32664EF235ca1d16e5FE8AE13fD",

    StakedFulDistributor: "0xF5027eaA9EC25056262b747Ab113CB48F5924050",
    StakedFlpDistributor: "0x629A8dd6BfF07844b25130ed659990d65e22Baaa",

    FulVester: "0xA461fA4BF68C72369DB4fA8eD7cba4796598F2B0",
    FlpVester: "0x27E51D2B5A3283bEF4014519F095AB8dDCf023F6",

    OrderBook: "0x1c29aeE30B5B101eDEa936Cd0cAeEc724e3B0045",
    OrderBookReader: "0x1db915E37889521e05332928F54C7c49Bd876af7",

    PositionRouter: "0x27fb69422c457452D8b6FDcb18899D9B53C3f940",
    PositionManager: "0xFC399dbb0Ed942D206Ee34Cc6FcbaF1CFd60dB16",

    CronosFulPool: "0x78025b23BfAa7FF0dfC8A1B7Ab91C4175D52E9d2",
    CronosCroPool: "0xe61Db569E231B3f5530168Aa2C9D50246525b6d6",
    CronosId: "0x7F4C61116729d5b27E5f180062Fdfbf32E9283E5",
    VVS_MINER_MOLE: "0x06596ed89ac4609de47a21af7e36b38b2df57c26",

    FulVesting: "0xFF7BBa181023a637E6F9fFfF5554C41dbb4981f4",

    Pyth: "0xE0d0e68297772Dd5a1f1D99897c581E2082dbA5B",

    CircuitBreaker: "0x963c77444fbB29C2E943fFe91353AaC390588C2E",

    MultiCall: "0x5e954f5972EC6BFc7dECd75779F10d848230345F",
    ReferralManager: "0xd565CB10930f63FC9B5244310Aa74bFD22069934",

    Timelock: "0x880a34751D8452df466ae27Ac341F987f0dAf3AE",
  },
  [ChainId.CRONOS_TESTNET]: {
    ...TOKEN_ADDRESS_BY_CHAIN[ChainId.CRONOS_TESTNET],
    NATIVE_TOKEN: "0x6a3173618859C7cd40fAF6921b5E9eB6A76f1fD4", // WCRO

    Vault: "0x081D1dEc9DD785aB31556905450cA3888bd0cfd7",
    VaultUtils: "0xB46FE68A78B0EA428A1C586e0a1534E624c3aE10",
    Router: "0x663F8feE6E7994d09CDFeE28f9D85218BB86242c",

    FlpManager: "0x337c0671df8aEa86326b8eB3661Ba15450Dc68Ed",
    OrderBook: "0x1C562F26c15331426eDc77EBb359463668B3B214",
    PositionRouter: "0x7b0223C018A3394Ad401F976594Ba82C6cBcf4C4",
    PositionManager: "0xf924bCE1F0bc07c6527F43484386D87b3D402DA6",
    Reader: "0x9378B2603D0bb8625899a78DaF05ff57BC1Ab42C",
    OrderBookReader: "0xff91E00E9CE452ACaE6Da9B03B4a3C40A7665Be0",
    VaultReader: "0xcf21369FAD10b86f5EaBB946648e25c96980d41a",

    RewardReader: "0x1ae4eAcB63Ce583E1cFC436EEb0f42C378F881D2",
    StakedFulTracker: "0xA8714e33106E4eA281D26e1C46c87a2661Fa6391",
    StakedFulDistributor: "0x49900A53CFC5C4AD6D0434119fb7fA67F99Babd5",
    BonusFulTracker: "0xFa92A5FAFd2949bc7C876e9D5c29271d497Ff691",
    FeeFulTracker: "0x98043631507A6A6d006Fc032943C07F7E11Ea639",
    FeeFlpTracker: "0xBCE7257922d498A3bFb1b492124bE91b1E24A77C",
    StakedFlpTracker: "0xD32a66EdCc3Fc9C2396eFDFfa0c69aC3da3a3AC8",
    StakedFlpDistributor: "0xB1AE5B66836709856E71167bd5eD43CC55e301D0",
    FulVester: "0x88aeDDD82f51aB952e961D6868F40Eed18E336eb",
    FlpVester: "0x2348442C78d3fE71dBE956585d89C15239a7dc56",
    RewardRouter: "0x8e0dAE8eBDF5dA7FC137080C1b6aa4e3a39b398D",

    CronosFulPool: "0x78d3CE4A2580f10faEEA17A7C89eb6379DCfF4bb",
    CronosCroPool: "0xaC7901EFB1F279a18e3f1973664cF4057DdbF0d9",
    CronosId: "0x16a23bFBcE9c53998c90201629E4cDB40B81B127",
    VVS_MINER_MOLE: "0xe8ebbe69f9ad4dcc1ac3802cd4c02a6ac1f11282",

    FulVesting: "0x471DA231f6A0C3b5B17b36Ce00446458a6215bab",

    Pyth: "0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320",

    CircuitBreaker: "0x4082CA36860d7f8673781e0e3c497ea3877DBA65",

    MultiCall: "0x3bd51a07d83305CcDB66678b0aAdEf4BC61c601e",

    ReferralManager: "0xfCbdb081477F3c93C40002A313304Bb15a3cF57e",

    Timelock: "0x1293cedfdc9486c281bE85A741bD728515c96280",
  },
};

export const getContractAddress = (
  contractName: ContractName,
  chainId: ChainId
): string => {
  return ADDRESS_BY_CHAIN[chainId][contractName]?.toLowerCase() ?? AddressZero;
};
