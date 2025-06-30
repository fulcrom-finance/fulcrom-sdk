import { BigNumber } from "@ethersproject/bignumber";
import { getDelta } from "../../../src/positions/utils/getDelta";
import * as getIsMinProfitTimeExpiredModule from "../../../src/positions/utils/getIsMinProfitTimeExpired";

jest.mock("../../../src/positions/utils/getIsMinProfitTimeExpired");

describe("getDelta", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getIsMinProfitTimeExpiredModule.getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(true);
  });

  it("returns 0 if averagePrice is 0", () => {
    const result = getDelta(
      BigNumber.from(0), // averagePrice
      BigNumber.from(1000), // size
      BigNumber.from(100), // sizeDelta
      0, // lastIncreasedTime
      BigNumber.from(2000), // entryPrice
      true // hasProfit
    );
    expect(result.eq(0)).toBe(true);
  });

  it("returns 0 if sizeDelta is 0", () => {
    const result = getDelta(
      BigNumber.from(2000),
      BigNumber.from(1000),
      BigNumber.from(0),
      0,
      BigNumber.from(2000),
      true
    );
    expect(result.eq(0)).toBe(true);
  });

  it("calculates delta when averagePrice > entryPrice", () => {
    const result = getDelta(
      BigNumber.from(2000), // averagePrice
      BigNumber.from(1000), // size
      BigNumber.from(100), // sizeDelta
      0,
      BigNumber.from(1500), // entryPrice
      true
    );
    // priceDelta = 2000 - 1500 = 500
    // delta = 100 * 500 / 2000 = 25
    expect(result.eq(25)).toBe(true);
  });

  it("calculates delta when entryPrice > averagePrice", () => {
    const result = getDelta(
      BigNumber.from(1500), // averagePrice
      BigNumber.from(1000), // size
      BigNumber.from(100), // sizeDelta
      0,
      BigNumber.from(2000), // entryPrice
      true
    );
    // priceDelta = 2000 - 1500 = 500
    // delta = 100 * 500 / 1500 = 33 (integer division)
    expect(result.eq(33)).toBe(true);
  });

  it("calculates delta when hasProfit is false", () => {
    const result = getDelta(
      BigNumber.from(2000),
      BigNumber.from(1000),
      BigNumber.from(100),
      0,
      BigNumber.from(1500),
      false
    );
    // priceDelta = 500, delta = 25
    expect(result.eq(25)).toBe(true);
  });

  it("calculates delta when isMinProfitTimeExpired is false (should not affect result with MIN_PROFIT_BIPS=0)", () => {
    (getIsMinProfitTimeExpiredModule.getIsMinProfitTimeExpired as jest.Mock).mockReturnValue(false);
    const result = getDelta(
      BigNumber.from(2000),
      BigNumber.from(1000),
      BigNumber.from(100),
      0,
      BigNumber.from(1500),
      true
    );
    expect(result.eq(25)).toBe(true);
  });
});
