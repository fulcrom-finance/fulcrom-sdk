import { Position } from "../types/position";
import { USD_DECIMALS } from "../config";
import { parseValue } from "../utils/numbers/parseValue";
import { DecreaseOrder } from "../query/graphql";
import { getOrdersForPosition } from "../positions/getOrdersForPosition";
/*
export const useExistingOrders = (): TradeOrder[] => {
  const position = useClosePositionModal((s) => s.position);
  const { data: tradeOrders } = Queries.useTradeOrders();

  return getOrdersForPosition(position, tradeOrders ?? []);
};*/

export const getExistingDecreaseOrders = ({
  isMarket,
  triggerPriceValue,
  position,
  decreaseOrders,
}: {
  isMarket: boolean;
  triggerPriceValue?: string;
  position: Position;
  decreaseOrders: DecreaseOrder[];
}) => {
  // stop orders can't be executed without corresponding opened position
  // const { data: decreaseOrders } = Queries.useDecreaseOrders();

  if (!isMarket || !triggerPriceValue) return [];

  const triggerPrice = parseValue(triggerPriceValue, USD_DECIMALS);

  const orders = getOrdersForPosition(position, decreaseOrders ?? []);

  return orders.filter((order) => {
    const triggerAboveThreshold = triggerPrice.gt(position.averagePrice);

    // if user creates Stop-Loss we need only Stop-Loss orders and vice versa
    return triggerAboveThreshold !== order.triggerAboveThreshold;
  });
};
