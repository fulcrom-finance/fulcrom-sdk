import { ONE_USD } from "../config";
import { TradeOrder } from "../query/graphql";
import { Position } from "../types/position";

export const getIsFullClose = (
  position: Pick<Position, "size">,
  order: Pick<TradeOrder, "sizeDelta">
) => {
  // fully close the position when the remaining position size is less than 1 USD.
  return position.size.gt(0) && position.size.sub(order.sizeDelta).lt(ONE_USD);
};
