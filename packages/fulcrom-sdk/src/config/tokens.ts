import appLogger from "../common/appLogger";
import type { IndexToken, PayGasToken, Token } from "../types";
import { ChainId } from "../types";
import { createPayGasTokenList } from "../utils/getPayGasTokenList";
import { createIndexTokenList } from "../utils/getTokenList";
import { getIsNative } from "../utils/nativeTokens";
import {
  type IndexTokenSymbol,
  type TokenSymbol,
  indexTokens,
} from "./address";
import { getChainInfo } from "./chains";

// Cronos Bridge will overwrite fiat on ramp behavior
export const getCronosBridgeTokenSymbol = (chainId: ChainId): TokenSymbol[] => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return [];
  }
};
// to control if open the entry to fiat on ramp or bridge modal, default to fiat on ramp
export const getExternalGainTokenSymbol = (chainId: ChainId): TokenSymbol[] => {
  switch (chainId) {
    case ChainId.CRONOS_MAINNET:
    case ChainId.CRONOS_TESTNET:
    default:
      return [
        "FUL",
        "CRO",
        "ETH",
        "USDC",
        "USDT",
        "ATOM",
        "ADA",
        "XRP",
        "LTC",
        "SOL",
        "PEPE",
        "DOGE",
        "SHIB",
        "NEAR",
      ];
  }
};

const tokenMap: Partial<Record<ChainId, readonly IndexToken[]>> = {};
const payGasTokenMap: Partial<Record<ChainId, readonly PayGasToken[]>> = {};

export const getIndexTokens = (chainId: ChainId): readonly IndexToken[] => {
  const tokenList = tokenMap[chainId];
  if (tokenList) {
    return tokenList;
  }
  const newTokenList = Object.freeze(createIndexTokenList(chainId));
  tokenMap[chainId] = newTokenList;

  return newTokenList;
};

export const getIndexTokenByAddressSafe = (
  address: string,
  chainId: ChainId
): IndexToken | undefined => {
  return getIndexTokens(chainId).find((v) => v.address === address);
};
export const getTokenByAddressSafe = (
  address: string,
  chainId: ChainId
): Token | undefined => {
  return getIndexTokenByAddressSafe(address, chainId);
};

export const getTokenBySymbol = (
  symbol: TokenSymbol,
  chainId: ChainId
): IndexToken => {
  if (getIsNative(symbol, chainId)) {
    return getChainInfo(chainId).nativeCurrency;
  }
  const token = getIndexTokens(chainId).find(
    (v) => v.symbol.toLowerCase() === symbol.toLowerCase()
  );

  if (!token) {
    throw new Error(`invalid symbol ${symbol} at chain ${chainId}`);
  }

  return token;
};

export const getTokenBySymbolSafe = (
  ...params: Parameters<typeof getTokenBySymbol>
) => {
  try {
    return getTokenBySymbol(...params);
  } catch (error) {
    appLogger.error("error in getTokenBySymbolSafe", error);
    return undefined;
  }
};

export const isIndexToken = (address: string, chainId: ChainId) => {
  const token = getIndexTokens(chainId).find((v) => v.address === address);

  return !!token;
};

export const isIndexTokenSymbol = (
  token: string
): token is IndexTokenSymbol => {
  return indexTokens.includes(token as any);
};

export const getStableTokens = (chainId: number): Token[] =>
  getIndexTokens(chainId).filter((v) => v.isStable);

export const getNonStableTokens = (chainId: number): IndexToken[] =>
  getIndexTokens(chainId).filter((v) => !v.isStable);

export const getPayGasTokens = (chainId: ChainId): readonly PayGasToken[] => {
  const tokenList = payGasTokenMap[chainId];
  if (tokenList) {
    return tokenList;
  }
  const newTokenList = Object.freeze(createPayGasTokenList(chainId));
  payGasTokenMap[chainId] = newTokenList;

  return newTokenList;
};

export const getNonStableTokenBySymbol = (
  symbol: TokenSymbol,
  chainId: number
): IndexToken => {
  if (getIsNative(symbol, chainId)) {
    return getChainInfo(chainId).nativeCurrency;
  }
  const token = getNonStableTokens(chainId).find((v) => v.symbol === symbol);
  if (!token) {
    throw new Error(`invalid symbol ${symbol} at chain ${chainId}`);
  }
  return token;
};
