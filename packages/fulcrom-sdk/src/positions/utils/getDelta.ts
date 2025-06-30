import { BigNumber } from "@ethersproject/bignumber";

import { getIsMinProfitTimeExpired } from "./getIsMinProfitTimeExpired";
import { BASIS_POINTS_DIVISOR, MIN_PROFIT_BIPS } from "../../config";

const getPriceDelta = (
  entryPrice: BigNumber,
  averagePrice: BigNumber
): BigNumber => {
  // const position = useClosePositionModal((s) => s.position);
  // const entryPrice = useEntryPrice();

  if (averagePrice.lte(0)) return BigNumber.from(0);

  //const { averagePrice } = position;

  const priceDelta = averagePrice.gt(entryPrice)
    ? averagePrice.sub(entryPrice)
    : entryPrice.sub(averagePrice);

  return priceDelta;
};

export const getDelta = (
  averagePrice: BigNumber,
  size: BigNumber,
  sizeDelta: BigNumber,
  lastIncreasedTime: number,
  entryPrice: BigNumber,
  hasProfit: boolean
): BigNumber => {
  const isMinProfitTimeExpired = getIsMinProfitTimeExpired(lastIncreasedTime);
  const priceDelta = getPriceDelta(entryPrice, averagePrice);

  if (averagePrice.lte(0) || sizeDelta.lte(0)) return BigNumber.from(0);

  let delta = sizeDelta.mul(priceDelta).div(averagePrice);

  /**
   * Profit forfeit:
   *
   * When
   *   1. MIN_PROFIT_TIME is not passed since the last position increase time
   *   2. and the profit percentage is less than MIN_PROFIT_BIPS
   *
   * the profit will be forfeited
   */
  if (
    hasProfit &&
    !isMinProfitTimeExpired &&
    delta.mul(BASIS_POINTS_DIVISOR).lte(size.mul(MIN_PROFIT_BIPS))
  ) {
    delta = BigNumber.from(0);
  }

  return delta;
};
