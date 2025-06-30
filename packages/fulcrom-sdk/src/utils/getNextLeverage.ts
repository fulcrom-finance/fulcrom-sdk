import { getFromUsdMin } from "../trade/utils/getFromUsdMin";
import { getMarginFeeBasisPoints } from "../query/marginFeeBasisPoints";
import { OrderType } from "../trade/orders/types/orderType";
import { getToUsdMax } from "../trade/utils/toValue";
import { ChainId, Token, TokenInfo } from "../types";
import { Position } from "../types/position";
import { getPositionLeverage } from "./position";
import { BigNumber } from "@ethersproject/bignumber";
import { cacheKeys, getDataWithCache } from "../cache";

export const getNextLeverage = async ({
  chainId,
  existingPosition,
  fromTokenInfo,
  fromAmount,
  toTokenInfo,
  triggerPrice,
  orderType,
  isLong,
  collateralTokenInfo,
  caches,
  leverage,
  precision,
}: {
  chainId: ChainId;
  existingPosition?: Position;
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo; //to token symbol
  isLong: boolean; //is long or short
  collateralTokenInfo: TokenInfo; //collateral token
  orderType: OrderType; //tradeType: Market/Limit/StopMarket
  // if StopMarket/LimitOrder
  triggerPrice: BigNumber; //trigger price
  caches: Map<string, any>; //caches
  // options
  leverage?: number; //leverage
  precision?: number; //precision
}) => {
  const sizeDelta = await getToUsdMax(
    chainId,
    fromTokenInfo,
    fromAmount,
    toTokenInfo,
    triggerPrice,
    orderType,
    isLong,
    collateralTokenInfo,
    caches,
    precision,
    leverage
  );
  const collateralDelta = getFromUsdMin(fromTokenInfo, fromAmount);
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );

  if (!existingPosition) return undefined;

  return getPositionLeverage(
    {
      ...existingPosition,
      sizeDelta,
      isIncreaseSize: true,
      collateralDelta,
      isIncreaseCollateral: true,
      isIncludeDelta: false,
      marginFeeBasisPoints,
    },
    chainId
  );
};
