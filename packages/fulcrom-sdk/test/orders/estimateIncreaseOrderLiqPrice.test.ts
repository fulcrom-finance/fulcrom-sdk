import { BigNumber } from "@ethersproject/bignumber";
import { estimateIncreaseOrderLiqPrice } from "../../src/orders/estimateIncreaseOrderLiqPrice";
import { Position } from "../../src/types/position";
import { IncreaseOrder, OrderType } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";
import { TokenInfo } from "../../src/types";

// Mock all utility functions for deterministic output
jest.mock("../../src/utils/position", () => ({
  getLiqPrice: jest.fn(() => BigNumber.from(777)),
  getNextAveragePrice: jest.fn(() => BigNumber.from(123)),
}));
jest.mock("../../src/orders/getOrderCollateralDeltaUsdValue", () => ({
  getOrderCollateralDeltaUsdValue: jest.fn(() => BigNumber.from(456)),
}));
jest.mock("../../src/orders/getPositionDelta", () => ({
  getPositionDelta: jest.fn(() => ({ hasProfit: true, delta: BigNumber.from(789) })),
}));

describe("estimateIncreaseOrderLiqPrice", () => {
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

  const order: IncreaseOrder = {
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

  const maxLiquidationLeverage = BigNumber.from(10);
  const fixedLiquidationFeeUsd = BigNumber.from(5);

  it("returns liq price from getLiqPrice for valid input with position", () => {
    const result = estimateIncreaseOrderLiqPrice({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      collateralTokenInfo,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe("777");
  });

  it("returns liq price from getLiqPrice for new position (no position)", () => {
    const result = estimateIncreaseOrderLiqPrice({
      position: undefined,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      collateralTokenInfo,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe("777");
  });

  it("calls getLiqPrice with correct arguments for existing position", () => {
    const { getLiqPrice } = require("../../src/utils/position");
    estimateIncreaseOrderLiqPrice({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      collateralTokenInfo,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(getLiqPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        isLong: order.isLong,
        averagePrice: expect.any(BigNumber),
        sizeDelta: order.sizeDelta,
        collateralDelta: expect.any(BigNumber),
        isIncreaseCollateral: true,
        isIncreaseSize: true,
        size: position.size,
        collateral: position.collateral,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        maxLiquidationLeverage,
        fixedLiquidationFeeUsd,
        marginFeeBasisPoints: 10,
      }),
      ChainId.CRONOS_MAINNET
    );
  });

  it("calls getLiqPrice with correct arguments for new position", () => {
    const { getLiqPrice } = require("../../src/utils/position");
    estimateIncreaseOrderLiqPrice({
      position: undefined,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      collateralTokenInfo,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(getLiqPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        isLong: order.isLong,
        size: expect.any(BigNumber),
        collateral: expect.any(BigNumber),
        sizeDelta: order.sizeDelta,
        isIncreaseSize: true,
        collateralDelta: expect.any(BigNumber),
        isIncreaseCollateral: true,
        averagePrice: order.triggerPrice,
        maxLiquidationLeverage,
        fixedLiquidationFeeUsd,
        marginFeeBasisPoints: 10,
      }),
      ChainId.CRONOS_MAINNET
    );
  });
});
