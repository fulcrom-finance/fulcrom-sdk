import { getLiquidationPrice } from "../../src/orders/getLiquidationPrice";
import { BigNumber } from "@ethersproject/bignumber";
import { OrderType, TradeOrder } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";
import { TokenInfo } from "../../src/types";
import { Position } from "../../src/types/position";

// Mock all dependencies for deterministic output
jest.mock("../../src/cache", () => ({
  getDataWithCache: jest.fn((_, key) => {
    if (key === "MaxLiquidationLeverage") return Promise.resolve(BigNumber.from(10));
    if (key === "FixedLiquidationFeeUsd") return Promise.resolve(BigNumber.from(5));
    if (key === "MarginFeeBasisPoints") return Promise.resolve(10);
    return Promise.resolve(undefined);
  }),
  cacheKeys: {
    MaxLiquidationLeverage: "MaxLiquidationLeverage",
    FixedLiquidationFeeUsd: "FixedLiquidationFeeUsd",
    MarginFeeBasisPoints: "MarginFeeBasisPoints",
  },
}));
jest.mock("../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn((order) => order.type === OrderType.IncreaseOrder),
}));
jest.mock("../../src/orders/estimateIncreaseOrderLiqPrice", () => ({
  estimateIncreaseOrderLiqPrice: jest.fn(() => BigNumber.from(111)),
}));
jest.mock("../../src/orders/estimateDecreaseOrderLiqPrice", () => ({
  estimateDecreaseOrderLiqPrice: jest.fn(() => BigNumber.from(222)),
}));

describe("getLiquidationPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const position: Position = {
    key: "pos1",
    collateralToken: "0xTokenC",
    indexToken: "0xTokenB",
    isLong: true,
    size: BigNumber.from(1000),
    collateral: BigNumber.from(500),
    averagePrice: BigNumber.from(10),
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
    leverage: BigNumber.from(5),
    liqPrice: BigNumber.from(1234),
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
    maxPrice: BigNumber.from(4),
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
    collateralDelta: BigNumber.from(50),
    triggerPrice: BigNumber.from(20),
    triggerAboveThreshold: false,
    timestamp: 0,
  };

  const caches = new Map();

  it("returns correct structure for increase order", async () => {
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      order: increaseOrder,
      position,
      collateralTokenInfo,
      caches,
    });
    expect(result.from?.toString()).toBe("1234");
    expect(result.to?.toString()).toBe("111");
  });

  it("returns correct structure for decrease order", async () => {
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      order: decreaseOrder,
      position,
      collateralTokenInfo,
      caches,
    });
    expect(result.from?.toString()).toBe("1234");
    expect(result.to?.toString()).toBe("222");
  });

  it("returns { from } if fixedLiquidationFeeUsd or maxLiquidationLeverage is missing", async () => {
    const { getDataWithCache } = require("../../src/cache");
    getDataWithCache.mockImplementationOnce(() => Promise.resolve(undefined));
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      order: increaseOrder,
      position,
      collateralTokenInfo,
      caches,
    });
    expect(result).toEqual({ from: BigNumber.from(1234) });
  });

  it("returns to as BIG_NUM_ZERO if nextLiq is negative", async () => {
    const { estimateIncreaseOrderLiqPrice } = require("../../src/orders/estimateIncreaseOrderLiqPrice");
    estimateIncreaseOrderLiqPrice.mockReturnValueOnce(BigNumber.from(-5));
    const result = await getLiquidationPrice({
      chainId: ChainId.CRONOS_MAINNET,
      order: increaseOrder,
      position,
      collateralTokenInfo,
      caches,
    });
    expect(result.to.toString()).toBe("0");
  });
});
