import { BigNumber } from "@ethersproject/bignumber";
import { getTradeOrderSwapFee } from "./getTradeOrderSwapFee";
import { expandDecimals, BASIS_POINTS_DIVISOR } from "../../config";
import { IncreaseOrder } from "../../query/graphql";
import { TokenInfo } from "../../types";
import { isIncreaseOrder } from "../getOrders";

/**
 * when create order, base on user input leverage, we calculate to token amount, then estimate its usd value as final position size in this hook `useNextToAmount` of file `ui/src/views/Trade/TradeBox/hooks/useNextToAmount.ts`
 *
 * this util reverse the calculation, given the position size, we estimate the leverage
 * ```
 * leverage = indexTokenAmountUsd / ((purchaseTokenAmountUsd - swapFee - useMarginFeeBasisPoints/10000 * indexTokenAmountUsd)) / 10000
 * ```
 */
export const estimateIncreaseOrderLeverageNewPosition = ({
  marginFeeBasisPoints,
  order,
  usdgSupply,
  totalWeight,
  indexToken,
  fromTokenInfo,
  collateralTokenInfo,
}: {
  marginFeeBasisPoints: number;
  usdgSupply: BigNumber;
  totalWeight: BigNumber;
  order: IncreaseOrder;
  indexToken: TokenInfo;
  fromTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
}): BigNumber | undefined => {
  const fromTokenAmount = isIncreaseOrder(order)
    ? order.purchaseTokenAmount
    : undefined;

  if (!fromTokenInfo || !fromTokenAmount) return;

  const fromUsdMin = fromTokenInfo
    ? fromTokenAmount
        .mul(fromTokenInfo?.maxPrice)
        .div(expandDecimals(fromTokenInfo.decimals))
    : undefined;

  const triggerPrice = order.triggerPrice;
  const toTokenMarketPrice = indexToken?.minPrice;

  if (!fromUsdMin || fromUsdMin.isZero() || !toTokenMarketPrice) return;

  const swapFee = getTradeOrderSwapFee({
    order,
    totalWeight,
    usdgSupply,
    toTokenInfo: indexToken,
    purchaseTokenInfo: fromTokenInfo,
    collateralTokenInfo: collateralTokenInfo,
  });
  const fromUsdMinAfterSwapFee = fromUsdMin.sub(swapFee);

  const nextToUsd = order.sizeDelta;

  /**
   * for increase order
   * when create
   *
   * toAmount * triggerPrice = positionSize
   *
   * toAmount = fromUsdMinAfterFees * leverage / toTokenPrice
   *
   */
  const priceRatio = toTokenMarketPrice
    .mul(BASIS_POINTS_DIVISOR)
    .mul(BASIS_POINTS_DIVISOR)
    .div(triggerPrice);

  /**
   * indexTokenAmountUsd
   *
   */
  const numerator = nextToUsd
    .mul(BASIS_POINTS_DIVISOR)
    .mul(BASIS_POINTS_DIVISOR);
  /**
   * // SwapFee 0.8% top, margin 0.1%
   * ((purchaseTokenAmountUsd - swapFee - useMarginFeeBasisPoints/10000 * indexTokenAmountUsd)) / 10000
   */
  const denominator = fromUsdMinAfterSwapFee
    .mul(BASIS_POINTS_DIVISOR)
    .sub(
      nextToUsd.mul(
        BigNumber.from(marginFeeBasisPoints)
          .mul(BASIS_POINTS_DIVISOR)
          .div(BASIS_POINTS_DIVISOR)
      )
    );

  const leverage = numerator
    .div(denominator)
    .mul(priceRatio)
    .div(BASIS_POINTS_DIVISOR)
    .div(BASIS_POINTS_DIVISOR);

  return leverage;
};
