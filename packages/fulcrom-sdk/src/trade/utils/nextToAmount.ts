import { BigNumber } from "@ethersproject/bignumber";

import { getMarginFeeBasisPoints } from "../../query/marginFeeBasisPoints";
import type { ChainId, TokenInfo } from "../../types";
import { getFromUsdMin } from "./getFromUsdMin";
import { getEntryPrice } from "./entryPrice";
import { OrderType } from "../orders/types/orderType";
import { getSwapFee } from "./fees";
import { getLeverage } from "./leverage";
import { BASIS_POINTS_DIVISOR, expandDecimals } from "../../config";
import { formatAmount } from "../../utils/numbers/formatAmount";
import { cacheKeys, getDataWithCache } from "../../cache";

export const getNextToAmount = async (
  chainId: ChainId,
  fromTokenInfo: TokenInfo,
  transactionAmount: BigNumber,
  toTokenInfo: TokenInfo,
  triggerPrice: BigNumber,
  orderType: OrderType,
  isLong: boolean,
  shortCollateralTokenInfo: TokenInfo,
  caches: Map<string, any>,
  leverageRatio?: number,
  precision?: number
) => {
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  const fromUsdMin = getFromUsdMin(fromTokenInfo, transactionAmount);

  const entryPrice = getEntryPrice(
    toTokenInfo,
    triggerPrice,
    orderType,
    isLong
  );

  const swapFee = await getSwapFee(
    chainId,
    isLong,
    transactionAmount,
    fromTokenInfo,
    shortCollateralTokenInfo,
    toTokenInfo,
    caches
  );

  const leverage = getLeverage(leverageRatio);

  // formula for calculating nextToAmount:
  //
  // x' = l(x - f(x'))
  // where
  // x': is the nextToAmount(the solution)
  // l: is the leverage:
  //        l = leverage / BASIS_POINTS_DIVISOR
  // x: is fromUsdMinAfterSwapFee
  // f(x'): is the position fee, f(x') = x' * k
  //        k = useMarginFeeBasisPoints/BASIS_POINTS_DIVISOR
  //
  // formula transformation:
  // x' = l(x - kx')
  //    = lx - lkx'
  //    = lx / (1 + lk)
  //
  // replace the parameters:
  // x' = (leverage / BASIS_POINTS_DIVISOR) * fromUsdMinAfterSwapFee
  //      / (1 + leverage / BASIS_POINTS_DIVISOR * useMarginFeeBasisPoints/BASIS_POINTS_DIVISOR)
  //    = leverage * BASIS_POINTS_DIVISOR * fromUsdMinAfterSwapFee /
  //      / (1 + leverage * useMarginFeeBasisPoints / BASIS_POINTS_DIVISOR^2)
  //
  // multiple BASIS_POINTS_DIVISOR^2 on both side:
  // x' = leverage * BASIS_POINTS_DIVISOR * fromUsdMinAfterSwapFee
  //      / (BASIS_POINTS_DIVISOR^2 + leverage * useMarginFeeBasisPoints)
  //
  // finally we got:
  // x' = numerator / denominator
  // numerator = fromUsdMinAfterSwapFee * leverage * BASIS_POINTS_DIVISOR
  // denominator = leverage * useMarginFeeBasisPoints + BASIS_POINTS_DIVISOR^2

  if (!fromUsdMin) return undefined;
  if (entryPrice.eq(0)) return undefined;
  if (toTokenInfo.maxPrice.eq(0)) return undefined;
  const fromUsdMinAfterSwapFee = fromUsdMin.sub(swapFee);

  const numerator = fromUsdMinAfterSwapFee
    .mul(leverage)
    .mul(BASIS_POINTS_DIVISOR);

  const denominator = BigNumber.from(marginFeeBasisPoints)
    .mul(leverage)
    .add(BigNumber.from(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR));

  const nextToUsd = numerator.div(denominator);

  const nextToAmount = nextToUsd
    .mul(precision ? expandDecimals(precision) : 1)
    .mul(expandDecimals(toTokenInfo.decimals))
    .div(toTokenInfo.maxPrice);

  return nextToAmount;
};


export const getNextToValue = (
  nextToAmount: BigNumber,
  toTokenInfo: TokenInfo
): string => {
  return formatAmount(nextToAmount, {
    decimals: toTokenInfo.decimals,
    displayDecimals: toTokenInfo.displayDecimals,
    thousandSeparator: false,
  });
};
