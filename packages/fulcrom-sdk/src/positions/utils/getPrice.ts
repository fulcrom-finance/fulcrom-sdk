import type { BigNumber } from "@ethersproject/bignumber";
import {
  BASIS_POINTS_DIVISOR,
  MIN_PROFIT_BIPS,
  USD_DECIMALS,
} from "../../config";
import { parseValue } from "../../utils/numbers/parseValue";

export const getEntryPrice = (
  isMarket: boolean,
  marketPrice: BigNumber,
  triggerPrice?: string
): BigNumber => {
  return isMarket || !triggerPrice
    ? marketPrice
    : parseValue(triggerPrice, USD_DECIMALS);
};

export const getProfitPrice = (
  isLong: boolean,
  averagePrice: BigNumber
): BigNumber => {
  // const position = useClosePositionModal((s) => s.position);

  const profitPrice = isLong
    ? averagePrice
        .mul(BASIS_POINTS_DIVISOR + MIN_PROFIT_BIPS)
        .div(BASIS_POINTS_DIVISOR)
    : averagePrice
        .mul(BASIS_POINTS_DIVISOR - MIN_PROFIT_BIPS)
        .div(BASIS_POINTS_DIVISOR);

  return profitPrice;
};
