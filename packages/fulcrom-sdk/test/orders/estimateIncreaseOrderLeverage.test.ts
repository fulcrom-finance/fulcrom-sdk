import { BigNumber } from "@ethersproject/bignumber";
import { estimateIncreaseOrderLeverage } from "../../src/orders/estimateIncreaseOrderLeverage";
import { Position } from "../../src/types/position";
import { IncreaseOrder, OrderType } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";
import { TokenInfo } from "../../src/types";

// Mock getPositionLeverage for deterministic output
jest.mock("../../src/utils/position", () => ({
  getPositionLeverage: jest.fn(() => BigNumber.from(888)),
}));

describe("estimateIncreaseOrderLeverage", () => {
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

  const purchaseTokenInfo: TokenInfo = {
    name: "TokenA",
    image: "imageA.png",
    symbol: "BTC" as const,
    decimals: 18,
    displayDecimals: 2,
    isStable: false,
    address: "0xTokenA",
    displaySymbol: "BTC",
    baseTokenSymbol: "BTC",
    baseTokenImage: "imageA.png",
    minPrice: BigNumber.from(2),
    maxPrice: BigNumber.from(2),
    averagePrice: BigNumber.from(2),
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

  it("returns leverage from getPositionLeverage for valid input", () => {
    const result = estimateIncreaseOrderLeverage({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
      purchaseTokenInfo,
    });
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe("888");
  });

  it("returns undefined if purchaseTokenInfo.minPrice is missing", () => {
    const result = estimateIncreaseOrderLeverage({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
      purchaseTokenInfo: { ...purchaseTokenInfo, minPrice: undefined as any },
    });
    expect(result).toBeUndefined();
  });

  it("calls getPositionLeverage with correct arguments", () => {
    const { getPositionLeverage } = require("../../src/utils/position");
    estimateIncreaseOrderLeverage({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
      purchaseTokenInfo,
    });
    expect(getPositionLeverage).toHaveBeenCalledWith(
      expect.objectContaining({
        isIncludeDelta: false,
        isIncreaseSize: true,
        isIncreaseCollateral: true,
        collateralDelta: expect.any(BigNumber),
        sizeDelta: order.sizeDelta,
        cumulativeFundingRate: position.cumulativeFundingRate,
        size: position.size,
        collateral: position.collateral,
        entryFundingRate: position.entryFundingRate,
        hasProfit: position.hasProfit,
        delta: position.delta,
        marginFeeBasisPoints: 10,
      }),
      ChainId.CRONOS_MAINNET
    );
  });
});
