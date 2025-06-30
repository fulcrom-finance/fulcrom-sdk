import { BIG_NUM_ZERO } from "../config/zero";
import { TradeOrder } from "../query/graphql";
import { Position } from "../types/position";
import { isIncreaseOrder } from "./getOrders";

export const getOrderWithPositionSize = (
  order: TradeOrder,
  position?: Position
) => {
  const decreaseSize = position?.size.sub(order.sizeDelta) || BIG_NUM_ZERO;
  const nextSize = isIncreaseOrder(order)
    ? order.sizeDelta.add(position?.size || BIG_NUM_ZERO)
    : decreaseSize.lt(BIG_NUM_ZERO)
    ? BIG_NUM_ZERO
    : decreaseSize;

  return {
    from: position?.size ? position.size : undefined,
    to: nextSize,
  };
};
