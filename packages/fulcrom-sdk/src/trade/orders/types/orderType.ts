export enum OrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopMarket = 'StopMarket',
}

/**
 * Checks if the provided OrderType is StopMarket.
 * @param orderType The OrderType to check.
 * @returns Returns true if the OrderType is StopMarket; otherwise, returns false.
 */
export function isStopMarket(orderType: OrderType): boolean {
  return orderType === OrderType.StopMarket;
}

export const isMarketOrder = (orderType: OrderType) => {
  return orderType === OrderType.Market;
};

export const isLimitOrder = (orderType: OrderType) => {
  return orderType === OrderType.Limit;
};

export function isStopOrLimitOrder(orderType: OrderType) {
  return isStopMarket(orderType) || isLimitOrder(orderType);
}