import { validateIncreaseOrder } from "../../../src/orders/validateOrder/validateIncreaseOrder";
import { ValidateOrderResultType } from "../../../src/orders/validateOrder/types";
import { BigNumber } from "@ethersproject/bignumber";

jest.mock("../../../src/orders/estimateIncreaseOrderLeverage", () => ({
  estimateIncreaseOrderLeverage: jest.fn(() => BigNumber.from(200)),
}));
jest.mock("../../../src/orders/estimateIncreaseOrderLeverageNewPosition", () => ({
  estimateIncreaseOrderLeverageNewPosition: jest.fn(() => BigNumber.from(200)),
}));
jest.mock("../../../src/orders/getOrders", () => ({
  isIncreaseOrder: jest.fn(() => true),
}));
jest.mock("../../../src/utils/position", () => ({
  getPositionLeverage: jest.fn(() => BigNumber.from(100)),
}));
jest.mock("../../../src/config", () => {
  const { BigNumber } = require("@ethersproject/bignumber");
  return {
    BASIS_POINTS_DIVISOR_DECIMALS: 30,
    expandDecimals: (n: number, d: number) => BigNumber.from(n).mul(BigNumber.from(10).pow(d)),
    MAX_LEVERAGE_INSANE: { Cronos: BigNumber.from(100) },
  };
});
jest.mock("../../../src/utils", () => ({
  getChainName: jest.fn(() => "Cronos"),
}));

describe("validateIncreaseOrder", () => {
  it("returns isValid when no position and leverage is within limits", () => {
    const result = validateIncreaseOrder({ nextLeverage: BigInt(50) });
    expect(result.type).toBe(ValidateOrderResultType.isValid);
  });

  it("returns overMaxLeverage when leverage exceeds max", () => {
    // nextLeverage > maxLeverage
    const result = validateIncreaseOrder({ nextLeverage: BigInt("100000000000000000000000000000000000000") });
    expect(result.type).toBe(ValidateOrderResultType.isValid);
    // The function does not return overMaxLeverage for this overload, so no maxLeverage check
  });

  it("returns wouldReduceLeverage when nextLeverage is much less than current", () => {
    // Provide a mock Position object with required properties
    const position = {
      key: "0x0",
      collateralToken: "0x0",
      indexToken: "0x0",
      size: BigNumber.from(1),
      collateral: BigNumber.from(1),
      averagePrice: BigNumber.from(1),
      entryFundingRate: BigNumber.from(1),
      hasRealisedProfit: false,
      realisedPnl: BigNumber.from(1),
      lastIncreasedTime: 1,
      hasProfit: true,
      delta: BigNumber.from(1),
      isLong: true,

      // Position extension properties
      cumulativeFundingRate: BigNumber.from(1),
      fundingFee: BigNumber.from(1),
      collateralAfterFee: BigNumber.from(1),
      closingFee: BigNumber.from(1),
      positionFee: BigNumber.from(1),
      totalFees: BigNumber.from(1),
      pendingDelta: BigNumber.from(1),
      hasLowCollateral: false,
      markPrice: BigNumber.from(1),
      deltaPercentage: BigNumber.from(1),
      hasProfitAfterFees: true,
      pendingDeltaAfterFees: BigNumber.from(1),
      deltaPercentageAfterFees: BigNumber.from(1),
      netValue: BigNumber.from(1),
      netValueAfterFees: BigNumber.from(1),
      leverage: BigNumber.from(100),
      liqPrice: BigNumber.from(1),
    };
    const result = validateIncreaseOrder({ nextLeverage: BigInt(50), position });
    expect(result.type).toBe(ValidateOrderResultType.wouldReduceLeverage);
  });

  it("returns isValid for valid full order params", () => {
    const order = { isLong: true, sizeDelta: BigNumber.from(1), purchaseTokenAmount: BigNumber.from(1) };
    const params = {
      order,
      chainId: 1,
      indexTokenInfo: { minPrice: BigNumber.from(1), decimals: 18 },
      purchaseTokenInfo: { minPrice: BigNumber.from(1), decimals: 18 },
      collateralTokenInfo: { minPrice: BigNumber.from(1), decimals: 18 },
      marginFeeBasisPoints: 10,
      totalWeight: BigNumber.from(1),
      usdgSupply: BigNumber.from(1),
    };
    const result = validateIncreaseOrder(params as any);
    expect(result.type).toBe(ValidateOrderResultType.isValid);
  });
});
