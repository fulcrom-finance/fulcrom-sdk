import type { BigNumber } from "@ethersproject/bignumber";
import { BIG_NUM_ZERO } from "../config/zero";
import { DecreaseOrder } from "../query/graphql";
import { ChainId } from "../types";
import { Position } from "../types/position";
import { getPositionLeverage } from "../utils/position";

/**
 * ref: ui/src/components/ClosePosition/hooks/useNextLeverage.ts
 */
export const estimateDecreaseOrderLeverage = ({
  position,
  order,
  chainId,
  marginFeeBasisPoints,
}: {
  position?: Position;
  order: DecreaseOrder;
  chainId: ChainId;
  marginFeeBasisPoints: number;
}): BigNumber | undefined => {
  if (!position) {
    // invalid order
    return;
  }

  const hasProfit = position.isLong
    ? order.triggerPrice.gt(position.averagePrice)
    : order.triggerPrice.lt(position.averagePrice);

  return (
    getPositionLeverage(
      {
        size: position.size,
        sizeDelta: order.sizeDelta,
        collateral: position.collateral,
        collateralDelta: order.collateralDelta,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit,
        marginFeeBasisPoints,
      },
      chainId
    ) ?? BIG_NUM_ZERO
  );
};
