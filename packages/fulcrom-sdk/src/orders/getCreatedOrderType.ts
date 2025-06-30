import { DecreaseOrder, IncreaseOrder, TradeOrder } from "../query/graphql";
import { CreatedOrderType } from "../types/order";
import { isDecreaseOrder } from "./getOrders";

export const getCreatedOrderType = (order: TradeOrder): CreatedOrderType => {
  if (isDecreaseOrder(order)) {
    return getDecreaseType(order);
  } else {
    return getIncreaseType(order);
  }
};

export const getIncreaseType = (
  order: IncreaseOrder
): CreatedOrderType.Limit | CreatedOrderType.StopMarket => {
  if (order.isLong) {
    if (order.triggerAboveThreshold) {
      return CreatedOrderType.StopMarket;
    } else {
      return CreatedOrderType.Limit;
    }
  } else {
    if (order.triggerAboveThreshold) {
      return CreatedOrderType.Limit;
    } else {
      return CreatedOrderType.StopMarket;
    }
  }
};

export const getDecreaseType = (
  order: DecreaseOrder
): CreatedOrderType.StopLoss | CreatedOrderType.TakeProfit => {
  if (order.isLong) {
    if (order.triggerAboveThreshold) {
      return CreatedOrderType.TakeProfit;
    } else {
      return CreatedOrderType.StopLoss;
    }
  } else {
    if (order.triggerAboveThreshold) {
      return CreatedOrderType.StopLoss;
    } else {
      return CreatedOrderType.TakeProfit;
    }
  }
};

export const getOrderLabel = ({
  tradeOrderType,
}: {
  tradeOrderType: CreatedOrderType;
}) => {
  switch (tradeOrderType) {
    case CreatedOrderType.Limit:
      return "Limit Order";
    case CreatedOrderType.StopMarket:
      return "Stop Market";
    case CreatedOrderType.StopLoss:
      return "Stop Loss";
    case CreatedOrderType.TakeProfit:
      return "Take Profit";
    default:
      return null;
  }
};
