import { getExistingDecreaseOrders } from "../../src/orders/getExistingOrders";
import { Position } from "../../src/types/position";
import { DecreaseOrder, OrderType } from "../../src/query/graphql";

// Mock parseValue and getOrdersForPosition for deterministic output
jest.mock("../../src/utils/numbers/parseValue", () => ({
  parseValue: jest.fn((val) => ({ gt: (other) => Number(val) > Number(other), toString: () => val })),
}));
jest.mock("../../src/positions/getOrdersForPosition", () => ({
  getOrdersForPosition: jest.fn((position, orders) => orders),
}));

describe("getExistingDecreaseOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const position: Position = {
    key: "pos1",
    collateralToken: "0xTokenC",
    indexToken: "0xTokenB",
    isLong: true,
    size: 1000 as any,
    collateral: 500 as any,
    averagePrice: 10 as any,
    entryFundingRate: 1 as any,
    hasRealisedProfit: false,
    realisedPnl: 0 as any,
    lastIncreasedTime: 0,
    hasProfit: false,
    delta: 0 as any,
    cumulativeFundingRate: 1 as any,
    fundingFee: 0 as any,
    collateralAfterFee: 0 as any,
    closingFee: 0 as any,
    positionFee: 0 as any,
    totalFees: 0 as any,
    pendingDelta: 0 as any,
    hasLowCollateral: false,
    markPrice: 0 as any,
    deltaPercentage: 0 as any,
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: 0 as any,
    deltaPercentageAfterFees: 0 as any,
    netValue: 0 as any,
    netValueAfterFees: 0 as any,
    leverage: 0 as any,
    liqPrice: 0 as any,
  };

  const orders: DecreaseOrder[] = [
    {
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
    },
    {
      type: OrderType.DecreaseOrder,
      id: "dec2",
      index: "1",
      account: "0xAccount" as any,
      isLong: true,
      executionFee: 0 as any,
      sizeDelta: 0 as any,
      indexToken: "0xTokenB",
      collateralToken: "0xTokenC",
      collateralDelta: 0 as any,
      triggerPrice: 0 as any,
      triggerAboveThreshold: true,
      timestamp: 0,
    },
  ];

  it("returns [] if isMarket is false", () => {
    const result = getExistingDecreaseOrders({
      isMarket: false,
      triggerPriceValue: "20",
      position,
      decreaseOrders: orders,
    });
    expect(result).toEqual([]);
  });

  it("returns [] if triggerPriceValue is missing", () => {
    const result = getExistingDecreaseOrders({
      isMarket: true,
      triggerPriceValue: undefined,
      position,
      decreaseOrders: orders,
    });
    expect(result).toEqual([]);
  });

  it("filters orders based on triggerAboveThreshold logic", () => {
    // parseValue("20").gt(10) === true, so triggerAboveThreshold = true
    const result = getExistingDecreaseOrders({
      isMarket: true,
      triggerPriceValue: "20",
      position,
      decreaseOrders: orders,
    });
    // Should keep only orders where triggerAboveThreshold !== true (i.e., false)
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("dec1");
  });

  it("filters orders based on triggerAboveThreshold logic (reverse)", () => {
    // parseValue("5").gt(10) === false, so triggerAboveThreshold = false
    const result = getExistingDecreaseOrders({
      isMarket: true,
      triggerPriceValue: "5",
      position,
      decreaseOrders: orders,
    });
    // Should keep only orders where triggerAboveThreshold !== false (i.e., true)
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("dec2");
  });
});
