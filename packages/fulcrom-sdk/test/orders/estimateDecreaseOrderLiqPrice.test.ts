import { BigNumber } from "@ethersproject/bignumber";
import { estimateDecreaseOrderLiqPrice } from "../../src/orders/estimateDecreaseOrderLiqPrice";
import { Position } from "../../src/types/position";
import { DecreaseOrder, OrderType } from "../../src/query/graphql";
import { ChainId } from "../../src/types/chain";

// Mock getLiqPrice and getIsFullClose for deterministic tests
jest.mock("../../src/utils/position", () => ({
  getLiqPrice: jest.fn(() => BigNumber.from(999)),
}));
jest.mock("../../src/orders/getIsFullClose", () => ({
  getIsFullClose: jest.fn(() => false),
}));

describe("estimateDecreaseOrderLiqPrice", () => {
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

  const maxLiquidationLeverage = BigNumber.from(10);
  const fixedLiquidationFeeUsd = BigNumber.from(5);

  it("returns liq price from getLiqPrice for valid input", () => {
    const result = estimateDecreaseOrderLiqPrice({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe("999");
  });

  it("returns undefined if position is missing", () => {
    const result = estimateDecreaseOrderLiqPrice({
      position: undefined,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(result).toBeUndefined();
  });

  it("calls getLiqPrice with sizeDelta/collateralDelta if not keep leverage", () => {
    const { getLiqPrice } = require("../../src/utils/position");
    const orderNotKeepLeverage = { ...order, collateralDelta: BigNumber.from(0) };
    estimateDecreaseOrderLiqPrice({
      position,
      order: orderNotKeepLeverage,
      chainId: ChainId.CRONOS_MAINNET,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    const callArg = getLiqPrice.mock.calls[0][0];
    expect(getLiqPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        sizeDelta: order.sizeDelta,
        collateralDelta: orderNotKeepLeverage.collateralDelta,
      }),
      ChainId.CRONOS_MAINNET
    );
  });

  it("calls getLiqPrice without sizeDelta/collateralDelta if keep leverage", () => {
    const { getLiqPrice } = require("../../src/utils/position");
    const { getIsFullClose } = require("../../src/orders/getIsFullClose");
    getIsFullClose.mockReturnValue(false);
    const orderKeepLeverage = { ...order, collateralDelta: BigNumber.from(1) };
    estimateDecreaseOrderLiqPrice({
      position,
      order: orderKeepLeverage,
      chainId: ChainId.CRONOS_MAINNET,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    // Should NOT have sizeDelta/collateralDelta in the first argument
    const callArg = getLiqPrice.mock.calls[0][0];
    expect(callArg.sizeDelta).toBeUndefined();
    expect(callArg.collateralDelta).toBeUndefined();
  });

  it("calls getLiqPrice for full close scenario", () => {
    const { getLiqPrice } = require("../../src/utils/position");
    const { getIsFullClose } = require("../../src/orders/getIsFullClose");
    getIsFullClose.mockReturnValue(true);
    estimateDecreaseOrderLiqPrice({
      position,
      order,
      chainId: ChainId.CRONOS_MAINNET,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints: 10,
    });
    expect(getLiqPrice).toHaveBeenCalled();
  });
});
