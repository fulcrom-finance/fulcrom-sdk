import { getLeverageChange } from "../../src/orders/getLeverageChange";
import { BigNumber } from "@ethersproject/bignumber";
import { OrderType, TradeOrder } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";
import { TokenInfo } from "../../src/types";
import { Position } from "../../src/types/position";

// Mock all dependencies for deterministic output
jest.mock("../../src/cache", () => ({
  getDataWithCache: jest.fn((_, key) => {
    if (key === "UsdgSypply") return Promise.resolve(BigNumber.from(1000));
    if (key === "TotalWeight") return Promise.resolve(BigNumber.from(2000));
    if (key === "MarginFeeBasisPoints") return Promise.resolve(10);
    return Promise.resolve(undefined);
  }),
  cacheKeys: {
    UsdgSypply: "UsdgSypply",
    TotalWeight: "TotalWeight",
    MarginFeeBasisPoints: "MarginFeeBasisPoints",
  },
}));
jest.mock("../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn((order) => order.type === OrderType.IncreaseOrder),
}));
jest.mock("../../src/orders/estimateIncreaseOrderLeverage", () => ({
  estimateIncreaseOrderLeverage: jest.fn(() => BigNumber.from(111)),
}));
jest.mock("../../src/orders/estimateIncreaseOrderLeverageNewPosition", () => ({
  estimateIncreaseOrderLeverageNewPosition: jest.fn(() => BigNumber.from(222)),
}));
jest.mock("../../src/orders/estimateDecreaseOrderLeverage", () => ({
  estimateDecreaseOrderLeverage: jest.fn(() => BigNumber.from(333)),
}));

describe("getLeverageChange", () => {
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
    liqPrice: BigNumber.from(0),
  };

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
    maxPrice: BigNumber.from(3),
    averagePrice: BigNumber.from(3),
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

  const purchaseTokenInfo = { ...indexTokenInfo, symbol: "BTC" as const, address: "0xTokenA" };
  const collateralTokenInfo = { ...indexTokenInfo, symbol: "USDC" as const, address: "0xTokenC" };

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

  it("returns correct structure for increase order with position", async () => {
    const result = await getLeverageChange(
      {
        chainId: ChainId.CRONOS_MAINNET,
        order: increaseOrder,
        position,
        indexTokenInfo,
        purchaseTokenInfo,
        collateralTokenInfo,
      },
      caches
    );
    expect(result.from?.toString()).toBe("5");
    expect(result.to?.toString()).toBe("111");
  });

  it("returns correct structure for increase order without position", async () => {
    const result = await getLeverageChange(
      {
        chainId: ChainId.CRONOS_MAINNET,
        order: increaseOrder,
        position: undefined,
        indexTokenInfo,
        purchaseTokenInfo,
        collateralTokenInfo,
      },
      caches
    );
    expect(result.from).toBeUndefined();
    expect(result.to?.toString()).toBe("222");
  });

  it("returns correct structure for decrease order", async () => {
    const result = await getLeverageChange(
      {
        chainId: ChainId.CRONOS_MAINNET,
        order: decreaseOrder,
        position,
        indexTokenInfo,
        purchaseTokenInfo,
        collateralTokenInfo,
      },
      caches
    );
    expect(result.from?.toString()).toBe("5");
    expect(result.to?.toString()).toBe("333");
  });
});
