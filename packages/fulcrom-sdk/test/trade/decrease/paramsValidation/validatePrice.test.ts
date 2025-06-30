import { validatePrice } from "../../../../src/trade/decrease/paramsValidation/validatePrice";
import { BigNumber } from "ethers";

// Mock config and utils
jest.mock("../../../../src/config", () => ({
  USD_DECIMALS: 18,
}));
jest.mock("../../../../src/utils/numbers/parseValue", () => ({
  parseValue: (val: string) => BigNumber.from(val),
}));
jest.mock("../../../../src/utils/numbers/formatAmountUsd", () => ({
  formatAmountUsd: (val: any, opts: any) => `usd:${val.toString()}:${opts.displayDecimals}`,
}));

const mockPosition = (overrides: Partial<any> = {}) => ({
  // RawPosition fields
  key: "0xkey",
  collateralToken: "0xcollateral",
  indexToken: "0xindex",
  isLong: true,
  size: BigNumber.from(0),
  collateral: BigNumber.from(0),
  averagePrice: BigNumber.from(0),
  entryFundingRate: BigNumber.from(0),
  hasRealisedProfit: false,
  realisedPnl: BigNumber.from(0),
  lastIncreasedTime: 0,
  hasProfit: false,
  delta: BigNumber.from(0),
  // Position fields
  cumulativeFundingRate: BigNumber.from(0),
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
  liqPrice: BigNumber.from("100"),
  ...overrides,
});

describe("validatePrice", () => {
  it("returns [] if no triggerExecutionPrice", () => {
    const result = validatePrice({
      position: mockPosition(),
      indexTokenInfo: { decimals: 2 } as any,
    });
    expect(result).toEqual([]);
  });

  it("returns error for long if triggerPrice <= liqPrice", () => {
    const result = validatePrice({
      position: mockPosition({ isLong: true, liqPrice: BigNumber.from("100") }),
      triggerExecutionPrice: "100",
      indexTokenInfo: { decimals: 2 } as any,
    });
    expect(result[0]).toContain("Price below Liq Price");
    expect(result[0]).toContain("usd:100:2");
  });

  it("returns error for short if triggerPrice >= liqPrice", () => {
    const result = validatePrice({
      position: mockPosition({ isLong: false, liqPrice: BigNumber.from("100") }),
      triggerExecutionPrice: "100",
      indexTokenInfo: { decimals: 2 } as any,
    });
    expect(result[0]).toContain("Price above Liq Price");
    expect(result[0]).toContain("usd:0:2-");
    expect(result[0]).toContain("usd:100:2");
  });

  it("returns [] for long if triggerPrice > liqPrice", () => {
    const result = validatePrice({
      position: mockPosition({ isLong: true, liqPrice: BigNumber.from("100") }),
      triggerExecutionPrice: "101",
      indexTokenInfo: { decimals: 2 } as any,
    });
    expect(result).toEqual([]);
  });

  it("returns [] for short if triggerPrice < liqPrice", () => {
    const result = validatePrice({
      position: mockPosition({ isLong: false, liqPrice: BigNumber.from("100") }),
      triggerExecutionPrice: "99",
      indexTokenInfo: { decimals: 2 } as any,
    });
    expect(result).toEqual([]);
  });
});
