import { BigNumber } from "@ethersproject/bignumber";

export const getHasProfit = (
  isLong: boolean, 
  entryPrice:BigNumber, 
  averagePrice: BigNumber,
): boolean => {

  if (!BigNumber.isBigNumber(entryPrice) || !BigNumber.isBigNumber(averagePrice)) {
    throw new Error("entryPrice and averagePrice must be BigNumber instances");
  }

  const hasProfit = isLong
    ? entryPrice.gt(averagePrice)
    : entryPrice.lt(averagePrice);

  return hasProfit;
};
