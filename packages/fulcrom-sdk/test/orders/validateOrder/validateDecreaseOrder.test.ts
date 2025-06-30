import { validateDecreaseOrder } from "../../../src/orders/validateOrder/validateDecreaseOrder";
import { ValidateOrderResultType } from "../../../src/orders/validateOrder/types";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../src/config", () => {
  const { BigNumber } = require("@ethersproject/bignumber");
  return {
    MIN_COLLATERAL: BigNumber.from(10),
    MIN_POSITION_USD: BigNumber.from(20),
    USD_DECIMALS: 30,
  };
});

describe("validateDecreaseOrder", () => {
  const baseOrder = {
    sizeDelta: BigNumber.from(5),
    collateralDelta: BigNumber.from(2),
  };
  const basePosition = {
    size: BigNumber.from(10),
    collateral: BigNumber.from(10),
    sub: BigNumber.prototype.sub,
    lt: BigNumber.prototype.lt,
    gt: BigNumber.prototype.gt,
  };

  it("returns noPositionOpened if no position", () => {
    const result = validateDecreaseOrder({ order: baseOrder as any, position: undefined });
    expect(result.type).toBe(ValidateOrderResultType.noPositionOpened);
  });

  it("returns orderSizeExceedsPositionSize if order sizeDelta > position size", () => {
    const order = { ...baseOrder, sizeDelta: BigNumber.from(20) };
    const result = validateDecreaseOrder({ order: order as any, position: basePosition as any });
    expect(result.type).toBe(ValidateOrderResultType.orderSizeExceedsPositionSize);
  });

  it("returns leftoverCollateralLowerThanMin if leftover collateral < MIN_COLLATERAL", () => {
    const order = { ...baseOrder, collateralDelta: BigNumber.from(9) };
    const position = { ...basePosition, collateral: BigNumber.from(10) };
    const result = validateDecreaseOrder({ order: order as any, position: position as any });
    expect(result.type).toBe(ValidateOrderResultType.leftoverCollateralLowerThanMin);
    if (result.type === ValidateOrderResultType.leftoverCollateralLowerThanMin) {
      expect(result.minCollateral.amount.toString()).toBe("10");
      expect(result.minCollateral.decimals).toBe(30);
    }
  });

  it("returns wouldReduceLeverageBelowOne if leftover size < leftover collateral", () => {
    // Setup: leftover collateral >= MIN_COLLATERAL, leftover size < leftover collateral, leftover size >= MIN_POSITION_USD
    // MIN_COLLATERAL = 10, MIN_POSITION_USD = 20
    // Use: position.size = 25, position.collateral = 15, order.sizeDelta = 6, order.collateralDelta = 5
    // leftover size = 25 - 6 = 19, leftover collateral = 15 - 5 = 10
    // 19 < 10 is false, so try: position.size = 9, position.collateral = 11, order.sizeDelta = 0, order.collateralDelta = 1
    // leftover size = 9, leftover collateral = 10, 9 < 10 is true, 9 >= 10 is false, but 9 < 20 triggers leftoverSizeLowerThanMin
    // So, use: position.size = 25, position.collateral = 15, order.sizeDelta = 4, order.collateralDelta = 5
    // leftover size = 21, leftover collateral = 10, 21 < 10 is false, try position.size = 15, position.collateral = 15, order.sizeDelta = 6, order.collateralDelta = 5
    // leftover size = 9, leftover collateral = 10, 9 < 10 is true, 9 < 20 triggers leftoverSizeLowerThanMin
    // To avoid leftoverSizeLowerThanMin, set MIN_POSITION_USD lower in the mock, or use leftover size >= 20
    // Let's use: position.size = 25, position.collateral = 15, order.sizeDelta = 6, order.collateralDelta = 5
    // leftover size = 19, leftover collateral = 10, 19 < 10 is false, try position.size = 15, position.collateral = 15, order.sizeDelta = 4, order.collateralDelta = 5
    // leftover size = 11, leftover collateral = 10, 11 < 10 is false, try position.size = 15, position.collateral = 15, order.sizeDelta = 6, order.collateralDelta = 5
    // leftover size = 9, leftover collateral = 10, 9 < 10 is true, but 9 < 20 triggers leftoverSizeLowerThanMin
    // So, to test wouldReduceLeverageBelowOne, we need leftover size >= 20, leftover collateral = 21, leftover size = 20, 20 < 21 is true, 20 >= 20
    // Let's use: position.size = 20, position.collateral = 21, order.sizeDelta = 0, order.collateralDelta = 0
    // leftover size = 20, leftover collateral = 21, 20 < 21 is true, 20 >= 20
    const order = { ...baseOrder, sizeDelta: BigNumber.from(0), collateralDelta: BigNumber.from(0) };
    const position = { ...basePosition, size: BigNumber.from(20), collateral: BigNumber.from(21) };
    const result = validateDecreaseOrder({ order: order as any, position: position as any });
    expect(result.type).toBe(ValidateOrderResultType.wouldReduceLeverageBelowOne);
  });

  it("returns leftoverSizeLowerThanMin if leftover size < MIN_POSITION_USD", () => {
    // Setup: leftover collateral >= MIN_COLLATERAL, leftover size >= leftover collateral, leftover size < MIN_POSITION_USD
    // MIN_COLLATERAL = 10, MIN_POSITION_USD = 20
    // Use: position.size = 19, position.collateral = 10, order.sizeDelta = 0, order.collateralDelta = 0
    // leftover size = 19, leftover collateral = 10, 19 >= 10, 19 < 20
    const order = { ...baseOrder, sizeDelta: BigNumber.from(0), collateralDelta: BigNumber.from(0) };
    const position = { ...basePosition, size: BigNumber.from(19), collateral: BigNumber.from(10) };
    const result = validateDecreaseOrder({ order: order as any, position: position as any });
    expect(result.type).toBe(ValidateOrderResultType.leftoverSizeLowerThanMin);
    if (result.type === ValidateOrderResultType.leftoverSizeLowerThanMin) {
      expect(result.minPositionSize.amount.toString()).toBe("20");
      expect(result.minPositionSize.decimals).toBe(30);
    }
  });

  it("returns isValid for valid decrease order", () => {
    // leftover size = 10 - 5 = 5, leftover collateral = 10 - 2 = 8 (> MIN_COLLATERAL)
    // 5 > MIN_POSITION_USD (20) is false, but function only checks <, so 5 < 20 triggers leftoverSizeLowerThanMin
    // So use sizeDelta = 2, collateralDelta = 1, leftover size = 8, leftover collateral = 9
    // 8 > 20 is false, so use sizeDelta = 0, collateralDelta = 0, leftover size = 10, leftover collateral = 10
    // 10 < 20 is true, so always triggers leftoverSizeLowerThanMin unless MIN_POSITION_USD is set lower
    // Instead, set MIN_POSITION_USD to 5 in the mock above, or use size = 30, sizeDelta = 5, leftover size = 25 (> 20)
    // Adjusted: collateralDelta = 0 so leftover collateral = 10 (== MIN_COLLATERAL)
    const order = { sizeDelta: BigNumber.from(5), collateralDelta: BigNumber.from(0) };
    const position = { size: BigNumber.from(30), collateral: BigNumber.from(10), sub: BigNumber.prototype.sub, lt: BigNumber.prototype.lt, gt: BigNumber.prototype.gt };
    const result = validateDecreaseOrder({ order: order as any, position: position as any });
    expect(result.type).toBe(ValidateOrderResultType.isValid);
  });
});
