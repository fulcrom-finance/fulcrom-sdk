import type { BigNumber } from "@ethersproject/bignumber";

import { getIsFullClose } from "./getIsFullClose";
import { getOrderCollateralDeltaUsdValue } from "./getOrderCollateralDeltaUsdValue";
import { BIG_NUM_ZERO } from "../config/zero";
import { TradeOrder } from "../query/graphql";
import { TokenInfo } from "../types";
import { Position } from "../types/position";
import { isIncreaseOrder } from "./getOrders";

export const getOrderCollateralUsdValue = ({
  order,
  position,
  useMinPrice,
  collateralTokenInfo,
}: {
  order: TradeOrder;
  position?: Position;
  useMinPrice?: boolean;
  collateralTokenInfo: TokenInfo;
}): BigNumber | undefined => {
  if (isIncreaseOrder(order)) {
    const collateralDelta = getOrderCollateralDeltaUsdValue({
      order,
      position,
      useMinPrice,
      collateralTokenInfo,
    });
    const nextCollateral = collateralDelta
      ? collateralDelta.add(position?.collateral || BIG_NUM_ZERO)
      : undefined;

    return nextCollateral;
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

    return position?.collateral.sub(order.collateralDelta);
  }
};
