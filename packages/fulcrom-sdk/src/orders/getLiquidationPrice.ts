import { BIG_NUM_ZERO } from "../config/zero";
import { TradeOrder } from "../query/graphql";
import { getFixedLiquidationFeeUsd } from "../query/vault/getFixedLiquidationFeeUsd";
import { getMaxLiquidationLeverage } from "../query/vault/getMaxLiquidationLeverage";
import { getMarginFeeBasisPoints } from "../query/marginFeeBasisPoints";
import { ChainId, TokenInfo } from "../types";
import { Position } from "../types/position";
import { estimateDecreaseOrderLiqPrice } from "./estimateDecreaseOrderLiqPrice";
import { estimateIncreaseOrderLiqPrice } from "./estimateIncreaseOrderLiqPrice";
import { isIncreaseOrder } from "./getOrders";
import { cacheKeys, getDataWithCache } from "../cache";

export const getLiquidationPrice = async ({
  chainId,
  order,
  position,
  collateralTokenInfo,
  caches,
}: {
  chainId: ChainId;
  order: TradeOrder;
  position?: Position;
  collateralTokenInfo?: TokenInfo;
  caches: Map<string, any>;
}) => {
  const maxLiquidationLeverage = await getDataWithCache(
    caches,
    cacheKeys.MaxLiquidationLeverage,
    getMaxLiquidationLeverage,
    chainId
  );
  const fixedLiquidationFeeUsd = await getDataWithCache(
    caches,
    cacheKeys.FixedLiquidationFeeUsd,
    getFixedLiquidationFeeUsd,
    chainId
  );
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  const from = position?.liqPrice;
  if (!fixedLiquidationFeeUsd || !maxLiquidationLeverage) {
    return { from };
  }
  let nextLiq = BIG_NUM_ZERO;
  if (isIncreaseOrder(order)) {
    if (collateralTokenInfo)
      nextLiq =
        estimateIncreaseOrderLiqPrice({
          chainId,
          order,
          position,
          collateralTokenInfo,
          fixedLiquidationFeeUsd,
          maxLiquidationLeverage,
          marginFeeBasisPoints,
        }) || BIG_NUM_ZERO;
  } else {
    nextLiq =
      estimateDecreaseOrderLiqPrice({
        chainId,
        fixedLiquidationFeeUsd,
        maxLiquidationLeverage,
        order,
        position,
        marginFeeBasisPoints,
      }) || BIG_NUM_ZERO;
  }

  const to = nextLiq.isNegative() ? BIG_NUM_ZERO : nextLiq;

  return {
    from,
    to,
  };
};
