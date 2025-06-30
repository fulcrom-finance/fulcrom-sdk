import { getOrderCollateralUsdValue } from "../../src/orders/getOrderCollateralUsdValue";
import { BigNumber } from "@ethersproject/bignumber";
import { TokenInfo } from "../../src/types";
import { TradeOrder, OrderType } from "../../src/query/graphql";

// Mock isIncreaseOrder, getOrderCollateralDeltaUsdValue, and getIsFullClose for deterministic output
jest.mock("../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn((order) => order.type === OrderType.IncreaseOrder),
}));
jest.mock("../../src/orders/getOrderCollateralDeltaUsdValue", () => ({
  getOrderCollateralDeltaUsdValue: jest.fn(() => BigNumber.from(10)),
}));
jest.mock("../../src/orders/getIsFullClose", () => ({
  getIsFullClose: jest.fn(() => false),
}));
import { BIG_NUM_ZERO } from "../../src/config/zero";

describe("getOrderCollateralUsdValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const increaseOrder: TradeOrder = {
    type: OrderType.IncreaseOrder,
    id: "order1",
    index: "1",
    account: "0xAccount" as any,
    isLong: true,
    executionFee: BigNumber.from(0),
    indexToken: "0xTokenB",
    purchaseToken: "0xTokenA",
    collateralToken: "0xTokenC",
    purchaseTokenAmount: BigNumber.from(100),
    sizeDelta: BigNumber.from(200),
    triggerPrice: BigNumber.from(20),
    triggerAboveThreshold: false,
    timestamp: 0,
    sl: BigNumber.from(0),
    tp: BigNumber.from(0),
    tpSlExecutionFee: BigNumber.from(0),
  };

  const decreaseOrder: TradeOrder = {
    type: OrderType.DecreaseOrder,
    id: "order2",
    index: "1",
    account: "0xAccount" as any,
    isLong: true,
    executionFee: BigNumber.from(0),
    sizeDelta: BigNumber.from(100),
    indexToken: "0xTokenB",
    collateralToken: "0xTokenC",
    collateralDelta: BigNumber.from(5),
    triggerPrice: BigNumber.from(20),
    triggerAboveThreshold: false,
    timestamp: 0,
  };

  const collateralTokenInfo: TokenInfo = {
    name: "TokenC",
    image: "imageC.png",
    symbol: "USDC" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenC",
    displaySymbol: "USDC",
    baseTokenSymbol: "USDC",
    baseTokenImage: "imageC.png",
    minPrice: BigNumber.from(4),
    maxPrice: BigNumber.from(5),
    averagePrice: BigNumber.from(4),
    isNative: false,
    usdgAmount: BigNumber.from(0),
    maxUsdgAmount: BigNumber.from(0),
    poolAmount: BigNumber.from(0),
    bufferAmount: BigNumber.from(0),
    managedAmount: BigNumber.from(0),
    managedUsd: BigNumber.from(0),
    availableAmount: BigNumber.from(0),
    availableUsd: BigNumber.from(0),
    guaranteedUsd: BigNumber.from(0),
    redemptionAmount: BigNumber.from(0),
    reservedAmount: BigNumber.from(0),
    balance: BigNumber.from(0),
    balanceUsdMin: BigNumber.from(0),
    balanceUsdMax: BigNumber.from(0),
    weight: BigNumber.from(0),
    globalShortSize: BigNumber.from(0),
    maxAvailableLong: BigNumber.from(0),
    maxAvailableShort: BigNumber.from(0),
    maxGlobalLongSize: BigNumber.from(0),
    maxGlobalShortSize: BigNumber.from(0),
    maxLongCapacity: BigNumber.from(0),
    candlePrices: { time: 0, open: 0, close: 0, high: 0, low: 0 },
  };

  it("returns nextCollateral for increase order", () => {
    const result = getOrderCollateralUsdValue({
      order: increaseOrder,
      position: { collateral: BigNumber.from(20) } as any,
      useMinPrice: true,
      collateralTokenInfo,
    });
    // getOrderCollateralDeltaUsdValue returns 10, position.collateral is 20
    expect(result?.toString()).toBe("30");
  });

  it("returns undefined for increase order if getOrderCollateralDeltaUsdValue returns undefined", () => {
    const { getOrderCollateralDeltaUsdValue } = require("../../src/orders/getOrderCollateralDeltaUsdValue");
    getOrderCollateralDeltaUsdValue.mockReturnValueOnce(undefined);
    const result = getOrderCollateralUsdValue({
      order: increaseOrder,
      position: { collateral: BigNumber.from(20) } as any,
      useMinPrice: true,
      collateralTokenInfo,
    });
    expect(result).toBeUndefined();
  });

  it("returns BIG_NUM_ZERO for decrease order if getIsFullClose returns true", () => {
    const { getIsFullClose } = require("../../src/orders/getIsFullClose");
    getIsFullClose.mockReturnValueOnce(true);
    const result = getOrderCollateralUsdValue({
      order: decreaseOrder,
      position: { collateral: BigNumber.from(20), size: BigNumber.from(100) } as any,
      useMinPrice: true,
      collateralTokenInfo,
    });
    expect(result?.toString()).toBe(BIG_NUM_ZERO.toString());
  });

  it("returns position.collateral - order.collateralDelta for decrease order if not full close", () => {
    const { getIsFullClose } = require("../../src/orders/getIsFullClose");
    getIsFullClose.mockReturnValueOnce(false);
    const result = getOrderCollateralUsdValue({
      order: decreaseOrder,
      position: { collateral: BigNumber.from(20), size: BigNumber.from(100) } as any,
      useMinPrice: true,
      collateralTokenInfo,
    });
    expect(result?.toString()).toBe("15");
  });

  it("returns undefined for decrease order if position is missing", () => {
    const result = getOrderCollateralUsdValue({
      order: decreaseOrder,
      position: undefined,
      useMinPrice: true,
      collateralTokenInfo,
    });
    // position.collateral is undefined, so undefined - order.collateralDelta is undefined
    expect(result).toBeUndefined();
  });
});
