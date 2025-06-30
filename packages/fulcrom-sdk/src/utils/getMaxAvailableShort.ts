import type { BigNumber } from "@ethersproject/bignumber";
import { TokenInfo } from "../types";
import { expandDecimals } from "./numbers/expandDecimals";

export const getMaxAvailableShort = (
  indexToken: TokenInfo,
  collateralToken: TokenInfo
): BigNumber => {
  let maxAvailableShort = collateralToken.availableAmount
    .mul(collateralToken.minPrice)
    .div(expandDecimals(collateralToken.decimals));

  if (
    indexToken.maxGlobalShortSize.gt(0) &&
    indexToken.maxAvailableShort.gt(0) &&
    indexToken.maxAvailableShort.lt(maxAvailableShort)
  ) {
    maxAvailableShort = indexToken.maxAvailableShort;
  }

  return maxAvailableShort;
};
