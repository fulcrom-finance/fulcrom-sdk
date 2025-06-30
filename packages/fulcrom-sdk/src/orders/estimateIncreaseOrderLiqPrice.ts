import type { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../types/position";
import { BIG_NUM_ZERO } from "../config/zero";
import { IncreaseOrder } from "../query/graphql";
import { ChainId, TokenInfo } from "../types";
import { getNextAveragePrice, getLiqPrice } from "../utils/position";
import { getOrderCollateralDeltaUsdValue } from "./getOrderCollateralDeltaUsdValue";
import { getPositionDelta } from "./getPositionDelta";

export const estimateIncreaseOrderLiqPrice = ({
  order,
  position,
  chainId,
  collateralTokenInfo,
  fixedLiquidationFeeUsd,
  maxLiquidationLeverage,
  marginFeeBasisPoints,
}: {
  position?: Position;
  order: IncreaseOrder;
  chainId: ChainId;
  collateralTokenInfo?: TokenInfo;
  maxLiquidationLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
  marginFeeBasisPoints: number;
}) => {
  const collateralDelta = getOrderCollateralDeltaUsdValue({
    order,
    position,
    useMinPrice: true,
    collateralTokenInfo,
  });
  if (position) {
    const delta = getPositionDelta(order.triggerPrice, position);
    const newAveragePrice = getNextAveragePrice({
      size: position.size,
      sizeDelta: order.sizeDelta,
      hasProfit: delta.hasProfit,
      delta: delta.delta,
      nextPrice: order.triggerPrice,
      isLong: order.isLong,
    });

    return getLiqPrice(
      {
        isLong: order.isLong,
        averagePrice: newAveragePrice,
        sizeDelta: order.sizeDelta,
        collateralDelta: collateralDelta,
        isIncreaseCollateral: true,
        isIncreaseSize: true,

        size: position.size,
        collateral: position.collateral,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,

        maxLiquidationLeverage,
        fixedLiquidationFeeUsd,
        marginFeeBasisPoints,
      },
      chainId
    );
  } else {
    // order will create new position
    return getLiqPrice(
      {
        isLong: order.isLong,
        size: BIG_NUM_ZERO,
        collateral: BIG_NUM_ZERO,
        sizeDelta: order.sizeDelta,
        isIncreaseSize: true,
        collateralDelta: collateralDelta,
        isIncreaseCollateral: true,
        averagePrice: order.triggerPrice,
        maxLiquidationLeverage,
        fixedLiquidationFeeUsd,
        marginFeeBasisPoints,
      },
      chainId
    );
  }
};
