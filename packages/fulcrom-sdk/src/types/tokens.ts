import { BigNumber } from "@ethersproject/bignumber";
import type { PriceCandle } from "./stats";
import { IndexToken, Token } from "./token";

export type ExtraTokenInfo = {
  usdgAmount: BigNumber;
  maxUsdgAmount: BigNumber;
  poolAmount: BigNumber;
  bufferAmount: BigNumber;
  managedAmount: BigNumber;
  managedUsd: BigNumber;
  availableAmount: BigNumber;
  availableUsd: BigNumber;
  guaranteedUsd: BigNumber;
  // @deprecated
  redemptionAmount: BigNumber;
  reservedAmount: BigNumber;
  balance: BigNumber;
  balanceUsdMin: BigNumber;
  balanceUsdMax: BigNumber;
  weight: BigNumber;
  maxPrice: BigNumber;
  minPrice: BigNumber;
  averagePrice: BigNumber;
  globalShortSize: BigNumber;
  maxAvailableLong: BigNumber;
  maxAvailableShort: BigNumber;
  maxGlobalLongSize: BigNumber;
  maxGlobalShortSize: BigNumber;
  maxLongCapacity: BigNumber;
};

export type CandlePricesInfo = {
  candlePrices: PriceCandle;
};

export type TokenInfo = Token & ExtraTokenInfo & CandlePricesInfo;

export type IndexTokenInfo = IndexToken & ExtraTokenInfo;

export type TokenInfoMap = {
  [address: string]: TokenInfo;
};

export type IndexTokenInfoMap = {
  [address: string]: IndexTokenInfo;
};

export type SimpleToken = Pick<Token, "address" | "symbol">;

export type BasicTokenInfo = Pick<
  TokenInfo,
  | "symbol"
  | "image"
  | "balance"
  | "balanceUsdMin"
  | "decimals"
  | "displayDecimals"
  | "displaySymbol"
>;
