import type { BigNumber } from "@ethersproject/bignumber";
import { expandDecimals } from "../config";
import { IncreaseOrder } from "../query/graphql";
import { ChainId, TokenInfo } from "../types";
import { Position } from "../types/position";
import { getPositionLeverage } from "../utils/position";

/**
 * ref: ui/src/views/Trade/TradeBox/hooks/useNextLeverage.ts
 */
export const estimateIncreaseOrderLeverage = ({
  position,
  order,
  chainId,
  marginFeeBasisPoints,
  purchaseTokenInfo,
}: {
  position: Position;
  order: IncreaseOrder;
  chainId: ChainId;
  marginFeeBasisPoints: number;
  purchaseTokenInfo: TokenInfo;
}): BigNumber | undefined => {
  // use minPrice to match the estimation when create order
  const purchaseTokenPrice = purchaseTokenInfo?.minPrice;

  if (!purchaseTokenPrice) return;

  const collateralDeltaUsd = order.purchaseTokenAmount
    .mul(purchaseTokenPrice)
    .div(expandDecimals(purchaseTokenInfo.decimals));

  const nextLeverage = getPositionLeverage(
    {
      isIncludeDelta: false,
      isIncreaseSize: true,
      isIncreaseCollateral: true,
      collateralDelta: collateralDeltaUsd,
      sizeDelta: order.sizeDelta,

      // existing position
      cumulativeFundingRate: position.cumulativeFundingRate,
      size: position.size,
      collateral: position.collateral,
      entryFundingRate: position.entryFundingRate,
      hasProfit: position.hasProfit,
      delta: position.delta,
      marginFeeBasisPoints,
    },
    chainId
  );

  return nextLeverage;
};
