import { getOrderMarketPrice, getEntryPrice } from "../../src/orders/getOrderMarketPrice";
import { BigNumber } from "@ethersproject/bignumber";
import { TokenInfo } from "../../src/types";
import { TradeOrder, OrderType } from "../../src/query/graphql";
import { Position } from "../../src/types/position";

// Mock isIncreaseOrder for deterministic output
jest.mock("../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn((order) => order.type === OrderType.IncreaseOrder),
}));

describe("getOrderMarketPrice", () => {
  const indexTokenInfo: TokenInfo = {
    name: "TokenB",
    image: "imageB.png",
    symbol: "ETH" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenB",
    displaySymbol: "ETH",
    baseTokenSymbol: "ETH",
    baseTokenImage: "imageB.png",
    minPrice: BigNumber.from(3),
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

  const baseOrder: TradeOrder = {
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

  it("returns maxPrice for long/increase", () => {
    const order = { ...baseOrder, isLong: true, type: OrderType.IncreaseOrder as OrderType.IncreaseOrder };
    expect(getOrderMarketPrice({ order, indexTokenInfo })).toEqual(indexTokenInfo.maxPrice);
  });

  it("returns minPrice for long/decrease", () => {
    const order = { ...baseOrder, isLong: true, type: OrderType.DecreaseOrder as OrderType.DecreaseOrder, collateralDelta: BigNumber.from(0) };
    expect(getOrderMarketPrice({ order, indexTokenInfo })).toEqual(indexTokenInfo.minPrice);
  });

  it("returns minPrice for short/increase", () => {
    const order = { ...baseOrder, isLong: false, type: OrderType.IncreaseOrder as OrderType.IncreaseOrder };
    expect(getOrderMarketPrice({ order, indexTokenInfo })).toEqual(indexTokenInfo.minPrice);
  });

  it("returns maxPrice for short/decrease", () => {
    const order = { ...baseOrder, isLong: false, type: OrderType.DecreaseOrder as OrderType.DecreaseOrder, collateralDelta: BigNumber.from(0) };
    expect(getOrderMarketPrice({ order, indexTokenInfo })).toEqual(indexTokenInfo.maxPrice);
  });

  it("returns undefined if indexTokenInfo is missing", () => {
    const order = { ...baseOrder, isLong: true, type: OrderType.IncreaseOrder as OrderType.IncreaseOrder };
    expect(getOrderMarketPrice({ order, indexTokenInfo: undefined })).toBeUndefined();
  });
});

describe("getEntryPrice", () => {
  const baseOrder: TradeOrder = {
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

  const position: Position = {
    key: "pos1",
    collateralToken: "0xTokenC",
    indexToken: "0xTokenB",
    isLong: true,
    size: BigNumber.from(1000),
    collateral: BigNumber.from(500),
    averagePrice: BigNumber.from(123),
    entryFundingRate: BigNumber.from(1),
    hasRealisedProfit: false,
    realisedPnl: BigNumber.from(0),
    lastIncreasedTime: 0,
    hasProfit: false,
    delta: BigNumber.from(0),
    cumulativeFundingRate: BigNumber.from(1),
    fundingFee: BigNumber.from(0),
    collateralAfterFee: BigNumber.from(0),
    closingFee: BigNumber.from(0),
    positionFee: BigNumber.from(0),
    totalFees: BigNumber.from(0),
    pendingDelta: BigNumber.from(0),
    hasLowCollateral: false,
    markPrice: BigNumber.from(0),
    deltaPercentage: BigNumber.from(0),
    hasProfitAfterFees: false,
    pendingDeltaAfterFees: BigNumber.from(0),
    deltaPercentageAfterFees: BigNumber.from(0),
    netValue: BigNumber.from(0),
    netValueAfterFees: BigNumber.from(0),
    leverage: BigNumber.from(0),
    liqPrice: BigNumber.from(0),
  };

  it("returns position.averagePrice if position exists", () => {
    expect(getEntryPrice({ order: baseOrder, position })).toEqual(position.averagePrice);
  });

  it("returns order.triggerPrice for increase order without position", () => {
    const order = { ...baseOrder, type: OrderType.IncreaseOrder as OrderType.IncreaseOrder };
    expect(getEntryPrice({ order, position: undefined })).toEqual(order.triggerPrice);
  });

  it("returns undefined for decrease order without position", () => {
    const order = { ...baseOrder, type: OrderType.DecreaseOrder as OrderType.DecreaseOrder, collateralDelta: BigNumber.from(0) };
    expect(getEntryPrice({ order, position: undefined })).toBeUndefined();
  });
});
