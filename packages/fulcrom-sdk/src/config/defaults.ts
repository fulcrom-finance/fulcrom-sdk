import { ChainId, TokenInfo, TokenInfoMap } from "../types";
import { getIndexTokens } from "./tokens";
import { BigNumber } from "@ethersproject/bignumber";

const defaultTokenInfo = {
  usdgAmount: BigNumber.from(0),
  maxUsdgAmount: BigNumber.from(0),
  poolAmount: BigNumber.from(0),
  bufferAmount: BigNumber.from(0),
  managedAmount: BigNumber.from(0),
  managedUsd: BigNumber.from(0),
  availableAmount: BigNumber.from(0),
  availableUsd: BigNumber.from(0),
  guaranteedUsd: BigNumber.from(0),
  redemptionAmount: BigNumber.from(0),
  reservedAmount: BigNumber.from(0),
  balance: BigNumber.from(0),
  balanceUsdMax: BigNumber.from(0),
  balanceUsdMin: BigNumber.from(0),
  weight: BigNumber.from(0),
  maxPrice: BigNumber.from(0),
  minPrice: BigNumber.from(0),
  averagePrice: BigNumber.from(0),
  globalShortSize: BigNumber.from(0),
  maxAvailableLong: BigNumber.from(0),
  maxAvailableShort: BigNumber.from(0),
  maxGlobalLongSize: BigNumber.from(0),
  maxGlobalShortSize: BigNumber.from(0),
  maxLongCapacity: BigNumber.from(0),
} as TokenInfo;

export const getDefaultTokenInfoMap = (chainId: ChainId): TokenInfoMap => {
  return getIndexTokens(chainId).reduce<TokenInfoMap>((acc, token) => {
    acc[token.address.toLowerCase()] = {
      ...defaultTokenInfo,
      ...token,
    };

    return acc;
  }, {});
};
