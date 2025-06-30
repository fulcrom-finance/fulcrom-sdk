import { BigNumber } from "@ethersproject/bignumber";
import { estimateDecreaseOrderLeverage } from "../../src/orders/estimateDecreaseOrderLeverage";
import { Position } from "../../src/types/position";
import { DecreaseOrder, OrderType } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";

// Mock getPositionLeverage to return a fixed value for deterministic tests
jest.mock("../../src/utils/position", () => ({
  getPositionLeverage: jest.fn(() => BigNumber.from(12345)),
}));

describe("estimateDecreaseOrderLeverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const dummyBN = BigNumber.from(1);
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

  const order: DecreaseOrder = {
    type: OrderType.DecreaseOrder,
    id: "order1",
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

  it("returns leverage from getPositionLeverage for valid input", () => {
    const result = estimateDecreaseOrderLeverage({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe("12345");
  });

  it("returns undefined if position is missing", () => {
    const result = estimateDecreaseOrderLeverage({
      position: undefined,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeUndefined();
  });

  it("calls getPositionLeverage with hasProfit true for long/profit", () => {
    const profitOrder = { ...order, triggerPrice: BigNumber.from(20) };
    const profitPosition = { ...position, isLong: true, averagePrice: BigNumber.from(10) };
    const { getPositionLeverage } = require("../../src/utils/position");
    estimateDecreaseOrderLeverage({
      position: profitPosition,
      order: profitOrder,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(getPositionLeverage).toHaveBeenCalledWith(
      expect.objectContaining({ hasProfit: true }),
      ChainId.CRONOS_MAINNET
    );
  });

  it("calls getPositionLeverage with hasProfit false for long/loss", () => {
    const lossOrder = { ...order, triggerPrice: BigNumber.from(5) };
    const lossPosition = { ...position, isLong: true, averagePrice: BigNumber.from(10) };
    const { getPositionLeverage } = require("../../src/utils/position");
    estimateDecreaseOrderLeverage({
      position: lossPosition,
      order: lossOrder,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(getPositionLeverage).toHaveBeenCalledWith(
      expect.objectContaining({ hasProfit: false }),
      ChainId.CRONOS_MAINNET
    );
  });

  it("calls getPositionLeverage with hasProfit true for short/profit", () => {
    const profitOrder = { ...order, triggerPrice: BigNumber.from(5), isLong: false };
    const profitPosition = { ...position, isLong: false, averagePrice: BigNumber.from(10) };
    const { getPositionLeverage } = require("../../src/utils/position");
    estimateDecreaseOrderLeverage({
      position: profitPosition,
      order: profitOrder,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(getPositionLeverage).toHaveBeenCalledWith(
      expect.objectContaining({ hasProfit: true }),
      ChainId.CRONOS_MAINNET
    );
  });

  it("calls getPositionLeverage with hasProfit false for short/loss", () => {
    const lossOrder = { ...order, triggerPrice: BigNumber.from(20), isLong: false };
    const lossPosition = { ...position, isLong: false, averagePrice: BigNumber.from(10) };
    const { getPositionLeverage } = require("../../src/utils/position");
    estimateDecreaseOrderLeverage({
      position: lossPosition,
      order: lossOrder,
      chainId: ChainId.CRONOS_MAINNET,
      marginFeeBasisPoints: 10,
    });
    expect(getPositionLeverage).toHaveBeenCalledWith(
      expect.objectContaining({ hasProfit: false }),
      ChainId.CRONOS_MAINNET
    );
  });
});
