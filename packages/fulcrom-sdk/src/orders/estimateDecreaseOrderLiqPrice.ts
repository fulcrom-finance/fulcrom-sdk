import type { BigNumber } from "@ethersproject/bignumber";
import { DecreaseOrder } from "../query/graphql";
import { ChainId } from "../types";
import { Position } from "../types/position";
import { getLiqPrice } from "../utils/position";
import { getIsFullClose } from "./getIsFullClose";

// ref: ui/src/components/ClosePosition/LiqPrice.tsx
export const estimateDecreaseOrderLiqPrice = ({
  order,
  position,
  chainId,
  fixedLiquidationFeeUsd,
  maxLiquidationLeverage,
  marginFeeBasisPoints,
}: {
  position?: Position;
  order: DecreaseOrder;
  chainId: ChainId;
  maxLiquidationLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
  marginFeeBasisPoints: number;
}) => {
  if (!position) return; // invalid order

  const isFullClose = getIsFullClose(position, order);

  const isKeepLeverage = !order.collateralDelta.eq(0) && !isFullClose;
  const nextLiqPrice = getLiqPrice(
    {
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints,

      // existing position
      isLong: position.isLong,
      size: position.size,
      collateral: position.collateral,
      averagePrice: position.averagePrice,
      entryFundingRate: position.entryFundingRate,
      cumulativeFundingRate: position.cumulativeFundingRate,

      // order changes
      isIncreaseSize: false,
      isIncreaseCollateral: false,

      // if keep leverage, collateral decrease, size decrease, leverage keep
      //  else if isFullClosing , return 0
      //    else  collateral unchanged, size decrease, leverage decrease
      ...(isKeepLeverage
        ? {}
        : {
            sizeDelta: order.sizeDelta,
            collateralDelta: order.collateralDelta,
          }),
    },
    chainId
  );

  return nextLiqPrice;
};
