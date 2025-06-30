 

import { AddressZero } from "@ethersproject/constants";
import type { IndexTokenSymbol } from "../config";
import {
  getContractAddress,
  PYTH_TOKEN_ID_BY_CHAIN_ID,
  TESTNET_CHAIN_IDS,
} from "../config";
import type { IndexToken } from "../types";
import { ChainId, ChainType } from "../types";

export const getChainType = (chainId: ChainId): ChainType => {
  if (TESTNET_CHAIN_IDS.includes(chainId)) {
    return ChainType.TestNet;
  } else {
    return ChainType.MainNet;
  }
};

export const isTestnet = (chainId: ChainId): boolean => {
  return getChainType(chainId) === ChainType.TestNet;
};

export const getTokenPythId = (
  symbol: IndexTokenSymbol,
  chainId: ChainId
): string => {
  return (
    PYTH_TOKEN_ID_BY_CHAIN_ID[chainId][symbol]?.toLowerCase() ?? AddressZero
  );
};

const defaultListDate = 1678957200000; // default to IGO timestamp

/**
 *
 * baseTokenSymbol : for displaying trading pair symbol
 *
 * baseTokenImage: for displaying trading pair img
 *
 */

const BTC = (chainId: ChainId): IndexToken => ({
  name: "Wrapped BTC",
  symbol: "BTC",
  decimals: 8,
  displayDecimals: 6,
  address: getContractAddress("BTC", chainId),
  isStable: false,
  image: "/tokens/btc.svg",
  candlePriceSymbol: "btc_usd",
  color: "#FF9D00",
  pythTokenId: getTokenPythId("BTC", chainId),
  listedAt: defaultListDate,
  displaySymbol: "BTC",
  baseTokenSymbol: "BTC",
  baseTokenImage: "/tokens/btc.svg",
});

const ETH = (chainId: ChainId): IndexToken => ({
  name: "Wrapped ETH",
  symbol: "ETH",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("ETH", chainId),
  isStable: false,
  image: "/tokens/eth.svg",
  candlePriceSymbol: "eth_usd",
  color: "#D3D8DA",
  pythTokenId: getTokenPythId("ETH", chainId),
  listedAt: defaultListDate,
  displaySymbol: "ETH",
  baseTokenSymbol: "ETH",
  baseTokenImage: "/tokens/eth.svg",
});

const USDC = (chainId: ChainId): IndexToken => ({
  name: "USD Coin Bridged",
  symbol: "USDC",
  decimals: 6,
  displayDecimals: 2,
  address: getContractAddress("USDC", chainId),
  isStable: true,
  image: "/tokens/usdc.svg",
  candlePriceSymbol: "usdc_usd",
  color: "#0069BF",
  pythTokenId: getTokenPythId("USDC", chainId),
  listedAt: defaultListDate,
  displaySymbol: "USDC",
  baseTokenSymbol: "USDC",
  baseTokenImage: "/tokens/usdc.svg",
});

const USDT = (chainId: ChainId): IndexToken => ({
  name: "Tether USD",
  symbol: "USDT",
  decimals: 6,
  displayDecimals: 2,
  address: getContractAddress("USDT", chainId),
  isStable: true,
  image: "/tokens/usdt.svg",
  candlePriceSymbol: "usdt_usd",
  color: "#009393",
  pythTokenId: getTokenPythId("USDT", chainId),
  listedAt: defaultListDate,
  displaySymbol: "USDT",
  baseTokenSymbol: "USDT",
  baseTokenImage: "/tokens/usdt.svg",
});

const ATOM = (chainId: ChainId): IndexToken => ({
  name: "Atom",
  symbol: "ATOM",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("ATOM", chainId),
  isStable: false,
  image: "/tokens/atom.svg",
  candlePriceSymbol: "atom_usd",
  color: "#2E3148",
  pythTokenId: getTokenPythId("ATOM", chainId),
  listedAt: defaultListDate,
  displaySymbol: "ATOM",
  baseTokenSymbol: "ATOM",
  baseTokenImage: "/tokens/atom.svg",
});

const ADA = (chainId: ChainId): IndexToken => ({
  name: "Ada",
  symbol: "ADA",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("ADA", chainId),
  isStable: false,
  image: "/tokens/ada.png",
  candlePriceSymbol: "ada_usd",
  color: "#3b5fa9",
  pythTokenId: getTokenPythId("ADA", chainId),
  listedAt: defaultListDate,
  displaySymbol: "ADA",
  baseTokenSymbol: "ADA",
  baseTokenImage: "/tokens/ada.png",
});

const XRP = (chainId: ChainId): IndexToken => ({
  name: "XRP",
  symbol: "XRP",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("XRP", chainId),
  isStable: false,
  image: "/tokens/xrp.svg",
  candlePriceSymbol: "xrp_usd",
  color: "#202020fc",
  pythTokenId: getTokenPythId("XRP", chainId),
  listedAt: defaultListDate,
  displaySymbol: "XRP",
  baseTokenSymbol: "XRP",
  baseTokenImage: "/tokens/xrp.svg",
});

const LTC = (chainId: ChainId): IndexToken => ({
  name: "Litecoin",
  symbol: "LTC",
  decimals: 8,
  displayDecimals: 4,
  address: getContractAddress("LTC", chainId),
  isStable: false,
  image: "/tokens/ltc.svg",
  candlePriceSymbol: "ltc_usd",
  color: "#6983AC",
  pythTokenId: getTokenPythId("LTC", chainId),
  listedAt: defaultListDate,
  displaySymbol: "LTC",
  baseTokenSymbol: "LTC",
  baseTokenImage: "/tokens/ltc.svg",
});

const BCH = (chainId: ChainId): IndexToken => ({
  name: "Bitcoin Cash",
  symbol: "BCH",
  decimals: 8,
  displayDecimals: 4,
  address: getContractAddress("BCH", chainId),
  isStable: false,
  image: "/tokens/bch.svg",
  candlePriceSymbol: "bch_usd",
  color: "#8DC351",
  pythTokenId: getTokenPythId("BCH", chainId),
  listedAt: defaultListDate,
  displaySymbol: "BCH",
  baseTokenSymbol: "BCH",
  baseTokenImage: "/tokens/bch.svg",
});

const SOL = (chainId: ChainId): IndexToken => ({
  name: "Solana",
  symbol: "SOL",
  decimals: 9,
  displayDecimals: 4,
  address: getContractAddress("SOL", chainId),
  isStable: false,
  image: "/tokens/sol.svg",
  candlePriceSymbol: "sol_usd",
  color: "#D17FF2",
  pythTokenId: getTokenPythId("SOL", chainId),
  listedAt: 1699948800000, // 2023 Nov 14 4pm GMT+8
  displaySymbol: "SOL",
  baseTokenSymbol: "SOL",
  baseTokenImage: "/tokens/sol.svg",
});

const PEPE = (chainId: ChainId): IndexToken => ({
  name: "PepeCoin",
  symbol: "PEPE",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("PEPE", chainId),
  isStable: false,
  image: "/tokens/pepe.svg",
  candlePriceSymbol: "pepe_usd",
  color: "#539D0D",
  pythTokenId: getTokenPythId("PEPE", chainId),
  listedAt: 1720574366000, // Wednesday, July 10, 2024 9:19:26 AM GMT+08:00
  displaySymbol: "PEPE",
  baseTokenSymbol: "PEPE",
  baseTokenImage: "/tokens/pepe.svg",
});

const DOGE = (chainId: ChainId): IndexToken => ({
  name: "Dogecoin",
  symbol: "DOGE",
  decimals: 8,
  displayDecimals: 4,
  address: getContractAddress("DOGE", chainId),
  isStable: false,
  image: "/tokens/doge.svg",
  candlePriceSymbol: "doge_usd",
  color: "#BBA034",
  pythTokenId: getTokenPythId("DOGE", chainId),
  listedAt: 1720574366000, // Wednesday, July 10, 2024 9:19:26 AM GMT+08:00
  displaySymbol: "DOGE",
  baseTokenSymbol: "DOGE",
  baseTokenImage: "/tokens/doge.svg",
});

const SHIB = (chainId: ChainId): IndexToken => ({
  name: "Shiba Inu",
  symbol: "SHIB",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("SHIB", chainId),
  isStable: false,
  image: "/tokens/shib.svg",
  candlePriceSymbol: "shib_usd",
  color: "#FFA502",
  pythTokenId: getTokenPythId("SHIB", chainId),
  listedAt: 1720574366000, // Wednesday, July 10, 2024 9:19:26 AM GMT+08:00
  displaySymbol: "SHIB",
  baseTokenSymbol: "SHIB",
  baseTokenImage: "/tokens/shib.svg",
});

const WIF = (chainId: ChainId): IndexToken => ({
  name: "dogwifhat",
  symbol: "WIF",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("WIF", chainId),
  isStable: false,
  image: "/tokens/wif.webp",
  candlePriceSymbol: "wif_usd",
  color: "#9a8572",
  pythTokenId: getTokenPythId("WIF", chainId),
  listedAt: 1721641538599,
  displaySymbol: "WIF",
  baseTokenSymbol: "WIF",
  baseTokenImage: "/tokens/wif.webp",
});
const NEAR = (chainId: ChainId): IndexToken => ({
  name: "Near Protocol",
  symbol: "NEAR",
  decimals: 24,
  displayDecimals: 4,
  address: getContractAddress("NEAR", chainId),
  isStable: false,
  image: "/tokens/near.svg",
  candlePriceSymbol: "near_usd",
  color: "#bfbfbffc",
  pythTokenId: getTokenPythId("NEAR", chainId),
  listedAt: 1721641538599,
  displaySymbol: "NEAR",
  baseTokenSymbol: "NEAR",
  baseTokenImage: "/tokens/near.svg",
});
const SUI = (chainId: ChainId): IndexToken => ({
  name: "SUI",
  symbol: "SUI",
  decimals: 9,
  displayDecimals: 4,
  address: getContractAddress("SUI", chainId),
  isStable: false,
  image: "/tokens/sui.png",
  candlePriceSymbol: "sui_usd",
  color: "#63affffd",
  pythTokenId: getTokenPythId("SUI", chainId),
  listedAt: 1733214247000,
  displaySymbol: "SUI",
  baseTokenSymbol: "SUI",
  baseTokenImage: "/tokens/sui.png",
});
const WCRO = (chainId: ChainId): IndexToken => ({
  name: "Wrapped CRO",
  symbol: "WCRO",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("WCRO", chainId),
  isStable: false,
  image: "/tokens/cro.svg",
  candlePriceSymbol: "cro_usd",
  color: "#2C3765", // color from icon
  pythTokenId: getTokenPythId("WCRO", chainId),
  listedAt: 1733990400000,
  displaySymbol: "WCRO",
  baseTokenSymbol: "WCRO",
  baseTokenImage: "/tokens/cro.svg",
});

const UNI = (chainId: ChainId): IndexToken => ({
  name: "Uniswap",
  symbol: "UNI",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("UNI", chainId),
  isStable: false,
  image: "/tokens/uni.svg",
  candlePriceSymbol: "uni_usd",
  color: "#F50A7A", // color from icon
  pythTokenId: getTokenPythId("UNI", chainId),
  listedAt: 1733990400000,
  displaySymbol: "UNI",
  baseTokenSymbol: "UNI",
  baseTokenImage: "/tokens/uni.svg",
});
const AAVE = (chainId: ChainId): IndexToken => ({
  name: "AAVE",
  symbol: "AAVE",
  decimals: 18,
  displayDecimals: 4,
  address: getContractAddress("AAVE", chainId),
  isStable: false,
  image: "/tokens/aave.svg",
  candlePriceSymbol: "aave_usd",
  color: "#7e8fb9f0", // color from icon
  pythTokenId: getTokenPythId("AAVE", chainId),
  listedAt: 1736239934000,
  displaySymbol: "AAVE",
  baseTokenSymbol: "AAVE",
  baseTokenImage: "/tokens/aave.svg",
});
const HBAR = (chainId: ChainId): IndexToken => ({
  name: "HBAR",
  symbol: "HBAR",
  decimals: 8,
  displayDecimals: 4,
  address: getContractAddress("HBAR", chainId),
  isStable: false,
  image: "/tokens/hbar.svg",
  candlePriceSymbol: "hbar_usd",
  color: "#545454", // color from icon
  pythTokenId: getTokenPythId("HBAR", chainId),
  listedAt: 1736239934000,
  displaySymbol: "HBAR",
  baseTokenSymbol: "HBAR",
  baseTokenImage: "/tokens/hbar.svg",
});

const PENGU = (chainId: ChainId): IndexToken => ({
  name: "PENGU",
  symbol: "PENGU",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("PENGU", chainId),
  isStable: false,
  image: "/tokens/pengu.webp",
  candlePriceSymbol: "pengu_usd",
  color: "#dae7f3", // color from icon
  pythTokenId: getTokenPythId("PENGU", chainId),
  listedAt: 1737357038000,
  displaySymbol: "PENGU",
  baseTokenSymbol: "PENGU",
  baseTokenImage: "/tokens/pengu.webp",
});
const TRUMP = (chainId: ChainId): IndexToken => ({
  name: "TRUMP",
  symbol: "TRUMP",
  decimals: 6,
  displayDecimals: 4,
  address: getContractAddress("TRUMP", chainId),
  isStable: false,
  image: "/tokens/trump.webp",
  candlePriceSymbol: "trump_usd",
  color: "#656153", // color from icon
  pythTokenId: getTokenPythId("TRUMP", chainId),
  listedAt: 1737423541000,
  displaySymbol: "TRUMP",
  baseTokenSymbol: "TRUMP",
  baseTokenImage: "/tokens/trump.webp",
});

/** separate the chain, and deal with test / main net diff inside */
export const getCronosTokenList = (
  chainId: Extract<ChainId, ChainId.CRONOS_MAINNET | ChainId.CRONOS_TESTNET>
): IndexToken[] => {
  return [
    {
      ...BTC(chainId),
      // 8 for mainnet, 18 for testnet in Cronos
      decimals: isTestnet(chainId) ? 18 : 8,
    },
    ETH(chainId),
    USDC(chainId),
    USDT(chainId),
    ATOM(chainId),
    ADA(chainId),
    XRP(chainId),
    LTC(chainId),
    BCH(chainId),
    SOL(chainId),
    PEPE(chainId),
    DOGE(chainId),
    SHIB(chainId),
    NEAR(chainId),
    WIF(chainId),
    SUI(chainId),
    WCRO(chainId),
    UNI(chainId),
    AAVE(chainId),
    HBAR(chainId),
    PENGU(chainId),
    TRUMP(chainId),
  ];
};

export const createIndexTokenList = (chainId: ChainId): IndexToken[] => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return getCronosTokenList(chainId);
  }
};
