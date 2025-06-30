import { TradeOrder } from "../query/graphql";
import { TokenInfo } from "../types";
import { Position } from "../types/position";
import { isIncreaseOrder } from "./getOrders";

export const getOrderMarketPrice = ({
  order,
  indexTokenInfo,
}: {
  order: TradeOrder;
  indexTokenInfo?: TokenInfo;
}) => {
  const isIncreaseOrder_ = isIncreaseOrder(order);
  const isLong = order.isLong;

  /**
   * 
   * For long:
      increase: max price
      decrease: min price
     For short:
      increase: min price
      decrease: max price
   * 
   */

  if (isLong) {
    return isIncreaseOrder_
      ? indexTokenInfo?.maxPrice
      : indexTokenInfo?.minPrice;
  } else {
    return isIncreaseOrder_
      ? indexTokenInfo?.minPrice
      : indexTokenInfo?.maxPrice;
  }
};

export const getEntryPrice = ({
  order,
  position,
}: {
  order: TradeOrder;
  position?: Position;
}) => {
  if (position) {
    return position.averagePrice;
  }

  if (isIncreaseOrder(order)) {
    // increase order without position is create new position, so entry price = trigger price
    return order.triggerPrice;
  } else {
    // decrease order without position is invalid, hence no entry price
    return;
  }
};
