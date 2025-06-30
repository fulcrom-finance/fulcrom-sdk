import { BigNumber } from "@ethersproject/bignumber";
import {
  MIN_PROFIT_TIME,
  BASIS_POINTS_DIVISOR,
  MIN_PROFIT_BIPS,
} from "../config";
import { Position } from "../types/position";

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
