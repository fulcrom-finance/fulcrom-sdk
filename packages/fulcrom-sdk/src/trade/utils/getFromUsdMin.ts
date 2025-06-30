import { expandDecimals } from "../../config";
import { TokenInfo } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";
export const getFromUsdMin = (fromToken: TokenInfo, amount: BigNumber) => {
  const { minPrice, decimals } = fromToken;

  if (!minPrice) return BigNumber.from(0);

  return amount.mul(minPrice).div(expandDecimals(decimals));
};
