import {
  OrderType,
  isStopMarket,
  isMarketOrder,
  isLimitOrder,
  isStopOrLimitOrder,
} from "../../../../src/trade/orders/types/orderType";

describe("OrderType enum", () => {
  it("should have correct values", () => {
    expect(OrderType.Market).toBe("Market");
    expect(OrderType.Limit).toBe("Limit");
    expect(OrderType.StopMarket).toBe("StopMarket");
  });
});

describe("OrderType utility functions", () => {
  it("isStopMarket returns true only for StopMarket", () => {
    expect(isStopMarket(OrderType.StopMarket)).toBe(true);
    expect(isStopMarket(OrderType.Market)).toBe(false);
    expect(isStopMarket(OrderType.Limit)).toBe(false);
  });

  it("isMarketOrder returns true only for Market", () => {
    expect(isMarketOrder(OrderType.Market)).toBe(true);
    expect(isMarketOrder(OrderType.Limit)).toBe(false);
    expect(isMarketOrder(OrderType.StopMarket)).toBe(false);
  });

  it("isLimitOrder returns true only for Limit", () => {
    expect(isLimitOrder(OrderType.Limit)).toBe(true);
    expect(isLimitOrder(OrderType.Market)).toBe(false);
    expect(isLimitOrder(OrderType.StopMarket)).toBe(false);
  });

  it("isStopOrLimitOrder returns true for StopMarket or Limit", () => {
    expect(isStopOrLimitOrder(OrderType.StopMarket)).toBe(true);
    expect(isStopOrLimitOrder(OrderType.Limit)).toBe(true);
    expect(isStopOrLimitOrder(OrderType.Market)).toBe(false);
  });
});
