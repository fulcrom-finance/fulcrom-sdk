import { BigNumber } from "@ethersproject/bignumber";
import { getCollateral } from "../../src/orders/getCollateral";
import { Position } from "../../src/types/position";
import { TokenInfo } from "../../src/types";
import { TradeOrder, OrderType } from "../../src/query/graphql";

// Mock getOrderCollateralUsdValue for deterministic output
jest.mock("../../src/orders/getOrderCollateralUsdValue", () => ({
  getOrderCollateralUsdValue: jest.fn(() => BigNumber.from(123)),
}));

describe("getCollateral", () => {
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
    leverage: BigNumber.from(0),
    liqPrice: BigNumber.from(0),
  };

  const order: TradeOrder = {
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

  it("returns from and to when both are present", () => {
    const result = getCollateral({
      order,
      position,
      collateralTokenInfo,
    });
    expect(result.from?.toString()).toBe("500");
    expect(result.to?.toString()).toBe("123");
  });

  it("returns undefined for from if position is missing", () => {
    const result = getCollateral({
      order,
      position: undefined,
      collateralTokenInfo,
    });
    expect(result.from).toBeUndefined();
    expect(result.to?.toString()).toBe("123");
  });

  it("returns undefined for to if getOrderCollateralUsdValue returns falsy", () => {
    const { getOrderCollateralUsdValue } = require("../../src/orders/getOrderCollateralUsdValue");
    getOrderCollateralUsdValue.mockReturnValueOnce(undefined);
    const result = getCollateral({
      order,
      position,
      collateralTokenInfo,
    });
    expect(result.from?.toString()).toBe("500");
    expect(result.to).toBeUndefined();
  });
});
