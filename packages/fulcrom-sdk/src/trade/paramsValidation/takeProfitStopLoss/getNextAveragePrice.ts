import { BigNumber } from "@ethersproject/bignumber";

import { getNextAveragePrice as getNextAveragePriceUtil } from "../../../utils/position";
import { Position } from "../../../types/position";
import {
  BASIS_POINTS_DIVISOR,
  MIN_PROFIT_BIPS,
  MIN_PROFIT_TIME,
  USD_DECIMALS,
} from "../../../config";
import { getToUsdMax } from "../../utils/toValue";
import { getEntryPrice } from "../../utils/entryPrice";
import { ChainId, TokenInfo } from "../../../types";
import { OrderType } from "../../orders/types/orderType";
import { parseValue } from "../../../utils/numbers/parseValue";

export const getNextAveragePrice = async ({
  chainId,
  toTokenInfo,
  isLong,
  orderType,
  triggerExecutionPrice,
  existingPosition,
  fromTokenInfo,
  fromAmount,
  collateralTokenInfo,
  caches,
  leverage,
  precision,
}: {
  triggerExecutionPrice?: string;
  chainId: ChainId;
  existingPosition?: Position;
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo; //to token symbol
  isLong: boolean; //is long or short
  collateralTokenInfo: TokenInfo; //collateral token
  orderType: OrderType; //tradeType: Market/Limit/StopMarket
  caches: Map<string, any>; //caches
  // options
  leverage?: number; //leverage
  precision?: number; //precision
}): Promise<BigNumber | undefined> => {
  const triggerPrice = parseValue(triggerExecutionPrice ?? "0", USD_DECIMALS);

  const entryPrice = getEntryPrice(
    toTokenInfo,
    triggerPrice,
    orderType,
    isLong
  );
  const toUsdMax = await getToUsdMax(
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
  const hasExistingPosition = !!existingPosition;

  if (!hasExistingPosition) return undefined;

  return estimateNewAveragePrice({
    entryPrice: OrderType.Market === orderType ? entryPrice : triggerPrice,
    existingPosition,
    isLong,
    isMarketOrder: OrderType.Market === orderType,
    sizeDelta: toUsdMax,
  });
};

export const getPositionDelta = (
  price: BigNumber,
  {
    size,
    collateral,
    isLong,
    averagePrice,
    lastIncreasedTime,
  }: Pick<
    Position,
    "size" | "collateral" | "isLong" | "averagePrice" | "lastIncreasedTime"
  >,
  sizeDelta?: BigNumber
) => {
  if (!sizeDelta) sizeDelta = size;

  const priceDelta = averagePrice.gt(price)
    ? averagePrice.sub(price)
    : price.sub(averagePrice);

  let delta = averagePrice.gt(0)
    ? sizeDelta.mul(priceDelta).div(averagePrice)
    : BigNumber.from(0);
  const pendingDelta = delta;

  const minProfitExpired =
    lastIncreasedTime + MIN_PROFIT_TIME < Date.now() / 1000;
  const hasProfit = isLong ? price.gt(averagePrice) : price.lt(averagePrice);
  if (
    !minProfitExpired &&
    hasProfit &&
    delta.mul(BASIS_POINTS_DIVISOR).lte(size.mul(MIN_PROFIT_BIPS))
  ) {
    delta = BigNumber.from(0);
  }

  const deltaPercentage = collateral.gt(0)
    ? delta.mul(BASIS_POINTS_DIVISOR).div(collateral)
    : BigNumber.from(0);

  const pendingDeltaPercentage = collateral.gt(0)
    ? pendingDelta.mul(BASIS_POINTS_DIVISOR).div(collateral)
    : BigNumber.from(0);

  return {
    delta,
    pendingDelta,
    pendingDeltaPercentage,
    hasProfit,
    deltaPercentage,
  };
};

type Props = {
  isLong: boolean;
  isMarketOrder: boolean;
  /**
   *  market order: market price
   *  limit order: trigger price
   */
  entryPrice: BigNumber;
  sizeDelta: BigNumber;
  existingPosition: Pick<
    Position,
    | "delta"
    | "hasProfit"
    | "size"
    | "collateral"
    | "isLong"
    | "averagePrice"
    | "lastIncreasedTime"
  >;
};

export const estimateNewAveragePrice = ({
  entryPrice,
  existingPosition,
  isLong,
  sizeDelta,
  isMarketOrder,
}: Props) => {
  const hasExistingPosition = !!existingPosition;

  if (!hasExistingPosition) return undefined;
  if (!entryPrice) return undefined;

  let nextDelta, nextHasProfit;

  if (isMarketOrder) {
    nextDelta = existingPosition.delta;
    nextHasProfit = existingPosition.hasProfit;
  } else {
    const data = getPositionDelta(entryPrice, existingPosition);
    nextDelta = data.delta;
    nextHasProfit = data.hasProfit;
  }

  return getNextAveragePriceUtil({
    size: existingPosition.size,
    sizeDelta: sizeDelta,
    hasProfit: nextHasProfit,
    delta: nextDelta,
    nextPrice: entryPrice,
    isLong,
  });
};
