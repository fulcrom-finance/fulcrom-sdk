import { TokenInfo } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";
import { BASIS_POINTS_DIVISOR } from "../../config";
import { Position } from "../../types/position";
import { getEntryPrice, getProfitPrice } from "../../positions/utils/getPrice";
import { getHasProfit } from "../../positions/utils/getHasProfit";
import { getIsMinProfitTimeExpired } from "../../positions/utils/getIsMinProfitTimeExpired";

// get the price limit for the create increase position
export const getIncreasePositionPriceLimit = (
  toToken: TokenInfo,
  allowedSlippageAmount: number,
  isLong: boolean
): BigNumber => {
  const refPrice =
    (isLong ? toToken.maxPrice : toToken.minPrice) ?? BigNumber.from(0);
  const priceBasisPoints = isLong
    ? BASIS_POINTS_DIVISOR + allowedSlippageAmount
    : BASIS_POINTS_DIVISOR - allowedSlippageAmount;

  const priceLimit = refPrice.mul(priceBasisPoints).div(BASIS_POINTS_DIVISOR);

  return priceLimit;
};

// get the price limit for the create decrease position
export const getDecreasePositionPriceLimit = (
  position: Position,
  isMarket: boolean,
  allowedSlippageAmount: number,
  triggerPrice?: string
): BigNumber => {
  const { isLong, markPrice, averagePrice, lastIncreasedTime } = position;

  const priceBasisPoints = isLong
    ? BASIS_POINTS_DIVISOR - allowedSlippageAmount
    : BASIS_POINTS_DIVISOR + allowedSlippageAmount;

  const refPrice = markPrice;
  let priceLimit = refPrice.mul(priceBasisPoints).div(BASIS_POINTS_DIVISOR);

  const entryPrice = getEntryPrice(isMarket, markPrice, triggerPrice);

  const hasProfit = getHasProfit(isLong, entryPrice, averagePrice);

  const isMinProfitTimeExpired = getIsMinProfitTimeExpired(lastIncreasedTime);

  const profitPrice = getProfitPrice(isLong, averagePrice);

  if (hasProfit && !isMinProfitTimeExpired) {
    if (
      (isLong && priceLimit.lt(profitPrice)) ||
      (!isLong && priceLimit.gt(profitPrice))
    ) {
      priceLimit = profitPrice;
    }
  }
  return priceLimit;
};

// get the price limit for the deposit collateral
export const getDepositCollateralPriceLimit = (
  isLong: boolean,
  isDeposit: boolean,
  allowedSlippageValue: number,
  maxPrice: BigNumber
): BigNumber => {
  const refPrice = maxPrice ?? BigNumber.from(0);

  let priceBasisPoints: number;

  if (isDeposit) {
    priceBasisPoints = isLong
      ? BASIS_POINTS_DIVISOR + allowedSlippageValue
      : BASIS_POINTS_DIVISOR - allowedSlippageValue;
  } else {
    priceBasisPoints = isLong
      ? BASIS_POINTS_DIVISOR - allowedSlippageValue
      : BASIS_POINTS_DIVISOR + allowedSlippageValue;
  }

  return refPrice.mul(priceBasisPoints).div(BASIS_POINTS_DIVISOR);
};
