import { cacheKeys, getDataWithCache } from "../cache";
import { GetOrdersQueryOpts } from "../query/gql";
import {
  DecreaseOrder,
  getOrdersGQL,
  IncreaseOrder,
  Order,
  OrderType,
  SwapOrder,
} from "../query/graphql";
import { Address, ChainId } from "../types";
import { CreatedOrderType, Orders } from "../types/order";
import { getCreatedOrderType } from "./getCreatedOrderType";

export const getOrders = async (
  account: Address,
  chainId: ChainId,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  return getDataWithCache(
    caches,
    cacheKeys.Orders,
    getOrdersGQL,
    account,
    chainId,
    opts
  );
};

export const getTradeOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);
  return orders.tradeOrders;
};

export const getIncreaseOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.increaseOrders;
};

export const getIncreaseOrdersMatchId = async (
  account: Address,
  chainId: ChainId,
  id: string,
  caches: Map<string, Orders>,
  opts?: GetOrdersQueryOpts
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.increaseOrders.filter((r) => r.id === id);
};

export const isIncreaseOrder = (order: Order): order is IncreaseOrder =>
  order.type === OrderType.IncreaseOrder;


export const getDecreaseOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.decreaseOrders;
};

/**
 * if position and order mapped, to make  isLong / indexToken / collateral Token the same
 * @param indexToken Address
 * @param collateralToken Address
 * @param isLong boolean
 * @param opts
 * @returns mapped Orders list
 */
export const getDecreaseOrdersMatch = async (
  account: Address,
  chainId: ChainId,
  indexToken: Address,
  collateralToken: Address,
  isLong: boolean,
  caches: Map<string, Orders>,
  opts?: GetOrdersQueryOpts
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.decreaseOrders.filter(
    (r) =>
      r.indexToken === indexToken &&
      r.collateralToken === collateralToken &&
      r.isLong === isLong
  );
};

export const getDecreaseOrdersMatchId = async (
  account: Address,
  chainId: ChainId,
  id: string,
  caches: Map<string, Orders>,
  opts?: GetOrdersQueryOpts
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.decreaseOrders.filter((r) => r.id === id);
};

export const isDecreaseOrder = (order: Order): order is DecreaseOrder =>
  order.type === OrderType.DecreaseOrder;

// if isLong = true and triggerAboveThreshold = true, it's a TP
// if isLong = false and triggerAboveThreshold = false, it's a TP
export const getTakeProfitOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.decreaseOrders.filter(
    (decreaseOrder) =>
      getCreatedOrderType(decreaseOrder) === CreatedOrderType.TakeProfit
  );
};

// if isLong = true and triggerAboveThreshold = false, it's a SL
// if isLong = false and triggerAboveThreshold = true, it's a SL
export const getStopLossOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.decreaseOrders.filter(
    (decreaseOrder) =>
      getCreatedOrderType(decreaseOrder) === CreatedOrderType.StopLoss
  );
};

export const isStopLossOrder = (decreaseOrder: DecreaseOrder) =>
  getCreatedOrderType(decreaseOrder) === CreatedOrderType.StopLoss;

export const isTakeProfitOrder = (decreaseOrder: DecreaseOrder) =>
  getCreatedOrderType(decreaseOrder) === CreatedOrderType.TakeProfit;

export const getSwapOrders = async (
  chainId: ChainId,
  account: Address,
  caches: Map<string, Orders>,
  opts?: Omit<GetOrdersQueryOpts, "account">
) => {
  const orders = await getOrders(account, chainId, caches, opts);

  return orders.swapOrders;
};

export const isSwapOrder = (order: Order): order is SwapOrder =>
  order.type === OrderType.SwapOrder;

export const getOrder = async ({
  account,
  chainId,
  orderType,
  orderId,
  caches,
}: {
  account: Address;
  chainId: ChainId;
  orderType: OrderType;
  orderId: string;
  caches: Map<string, Orders>;
}) => {
  const orders =
    orderType === OrderType.IncreaseOrder
      ? await getIncreaseOrders(chainId, account, caches)
      : await getDecreaseOrders(chainId, account, caches);

  return orders.find((order) => order.id === orderId);
};
