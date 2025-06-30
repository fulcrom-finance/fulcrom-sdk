import {
  getCreatedOrderType,
  getIncreaseType,
  getDecreaseType,
  getOrderLabel,
} from "../../src/orders/getCreatedOrderType";
import { CreatedOrderType } from "../../src/types/order";
import { IncreaseOrder, DecreaseOrder, OrderType } from "../../src/query/graphql";

// Mock isDecreaseOrder for deterministic branching
jest.mock("../../src/orders/getOrders", () => ({
  isDecreaseOrder: jest.fn((order) => order.type === OrderType.DecreaseOrder),
}));

describe("getCreatedOrderType", () => {
  const baseIncreaseOrder: IncreaseOrder = {
    type: OrderType.IncreaseOrder,
    id: "inc1",
    index: "1",
    account: "0xAccount" as any,
    isLong: true,
    executionFee: 0 as any,
    indexToken: "0xTokenB",
    purchaseToken: "0xTokenA",
    collateralToken: "0xTokenC",
    purchaseTokenAmount: 0 as any,
    sizeDelta: 0 as any,
    triggerPrice: 0 as any,
    triggerAboveThreshold: false,
    timestamp: 0,
    sl: 0 as any,
    tp: 0 as any,
    tpSlExecutionFee: 0 as any,
  };

  const baseDecreaseOrder: DecreaseOrder = {
    type: OrderType.DecreaseOrder,
    id: "dec1",
    index: "1",
    account: "0xAccount" as any,
    isLong: true,
    executionFee: 0 as any,
    sizeDelta: 0 as any,
    indexToken: "0xTokenB",
    collateralToken: "0xTokenC",
    collateralDelta: 0 as any,
    triggerPrice: 0 as any,
    triggerAboveThreshold: false,
    timestamp: 0,
  };

  it("returns correct type for increase order (long, triggerAboveThreshold=false)", () => {
    const order = { ...baseIncreaseOrder, isLong: true, triggerAboveThreshold: false };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.Limit);
  });

  it("returns correct type for increase order (long, triggerAboveThreshold=true)", () => {
    const order = { ...baseIncreaseOrder, isLong: true, triggerAboveThreshold: true };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.StopMarket);
  });

  it("returns correct type for increase order (short, triggerAboveThreshold=false)", () => {
    const order = { ...baseIncreaseOrder, isLong: false, triggerAboveThreshold: false };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.StopMarket);
  });

  it("returns correct type for increase order (short, triggerAboveThreshold=true)", () => {
    const order = { ...baseIncreaseOrder, isLong: false, triggerAboveThreshold: true };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.Limit);
  });

  it("returns correct type for decrease order (long, triggerAboveThreshold=false)", () => {
    const order = { ...baseDecreaseOrder, isLong: true, triggerAboveThreshold: false };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.StopLoss);
  });

  it("returns correct type for decrease order (long, triggerAboveThreshold=true)", () => {
    const order = { ...baseDecreaseOrder, isLong: true, triggerAboveThreshold: true };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.TakeProfit);
  });

  it("returns correct type for decrease order (short, triggerAboveThreshold=false)", () => {
    const order = { ...baseDecreaseOrder, isLong: false, triggerAboveThreshold: false };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.TakeProfit);
  });

  it("returns correct type for decrease order (short, triggerAboveThreshold=true)", () => {
    const order = { ...baseDecreaseOrder, isLong: false, triggerAboveThreshold: true };
    expect(getCreatedOrderType(order)).toBe(CreatedOrderType.StopLoss);
  });
});

describe("getIncreaseType", () => {
  it("returns StopMarket for long/triggerAboveThreshold", () => {
    expect(getIncreaseType({ isLong: true, triggerAboveThreshold: true } as any)).toBe(
      CreatedOrderType.StopMarket
    );
  });
  it("returns Limit for long/!triggerAboveThreshold", () => {
    expect(getIncreaseType({ isLong: true, triggerAboveThreshold: false } as any)).toBe(
      CreatedOrderType.Limit
    );
  });
  it("returns Limit for short/triggerAboveThreshold", () => {
    expect(getIncreaseType({ isLong: false, triggerAboveThreshold: true } as any)).toBe(
      CreatedOrderType.Limit
    );
  });
  it("returns StopMarket for short/!triggerAboveThreshold", () => {
    expect(getIncreaseType({ isLong: false, triggerAboveThreshold: false } as any)).toBe(
      CreatedOrderType.StopMarket
    );
  });
});

describe("getDecreaseType", () => {
  it("returns TakeProfit for long/triggerAboveThreshold", () => {
    expect(getDecreaseType({ isLong: true, triggerAboveThreshold: true } as any)).toBe(
      CreatedOrderType.TakeProfit
    );
  });
  it("returns StopLoss for long/!triggerAboveThreshold", () => {
    expect(getDecreaseType({ isLong: true, triggerAboveThreshold: false } as any)).toBe(
      CreatedOrderType.StopLoss
    );
  });
  it("returns StopLoss for short/triggerAboveThreshold", () => {
    expect(getDecreaseType({ isLong: false, triggerAboveThreshold: true } as any)).toBe(
      CreatedOrderType.StopLoss
    );
  });
  it("returns TakeProfit for short/!triggerAboveThreshold", () => {
    expect(getDecreaseType({ isLong: false, triggerAboveThreshold: false } as any)).toBe(
      CreatedOrderType.TakeProfit
    );
  });
});

describe("getOrderLabel", () => {
  it("returns correct label for each CreatedOrderType", () => {
    expect(getOrderLabel({ tradeOrderType: CreatedOrderType.Limit })).toBe("Limit Order");
    expect(getOrderLabel({ tradeOrderType: CreatedOrderType.StopMarket })).toBe("Stop Market");
    expect(getOrderLabel({ tradeOrderType: CreatedOrderType.StopLoss })).toBe("Stop Loss");
    expect(getOrderLabel({ tradeOrderType: CreatedOrderType.TakeProfit })).toBe("Take Profit");
  });
  it("returns null for unknown type", () => {
    expect(getOrderLabel({ tradeOrderType: 999 as any })).toBeNull();
  });
});
