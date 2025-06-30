import type { BigNumber } from "@ethersproject/bignumber";
import { expandDecimals } from "../config";
import { BIG_NUM_ZERO } from "../config/zero";
import { TradeOrder } from "../query/graphql";
import { TokenInfo } from "../types";
import { Position } from "../types/position";
import { isIncreaseOrder } from "./getOrders";
import { getIsFullClose } from "./getIsFullClose";

export const getOrderCollateralDeltaUsdValue = ({
  order,
  position,
  useMinPrice,
  collateralTokenInfo,
}: {
  order: TradeOrder;
  position?: Position;
  useMinPrice?: boolean;
  collateralTokenInfo?: TokenInfo;
}): BigNumber | undefined => {
  if (isIncreaseOrder(order)) {
    if (!collateralTokenInfo) return;

    return order.purchaseTokenAmount
      .mul(
        useMinPrice
          ? collateralTokenInfo.minPrice
          : collateralTokenInfo.maxPrice
      )
      .div(expandDecimals(collateralTokenInfo.decimals));
  } else {
    if (
      getIsFullClose(
        {
          size: position?.size || BIG_NUM_ZERO,
        },
        order
      )
    ) {
      return BIG_NUM_ZERO;
    }

    return order.collateralDelta;
  }
};
