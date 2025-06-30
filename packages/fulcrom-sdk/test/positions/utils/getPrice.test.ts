import { BigNumber } from "@ethersproject/bignumber";
import { getEntryPrice, getProfitPrice } from "../../../src/positions/utils/getPrice";
import * as parseValueModule from "../../../src/utils/numbers/parseValue";

jest.mock("../../../src/utils/numbers/parseValue");

describe("getEntryPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (parseValueModule.parseValue as jest.Mock).mockReturnValue(BigNumber.from(12345));
  });

  it("returns marketPrice if isMarket is true", () => {
    const marketPrice = BigNumber.from(1000);
    const result = getEntryPrice(true, marketPrice, "2000");
    expect(result).toBe(marketPrice);
    expect(parseValueModule.parseValue).not.toHaveBeenCalled();
  });

  it("returns marketPrice if triggerPrice is falsy", () => {
    const marketPrice = BigNumber.from(1000);
    const result = getEntryPrice(false, marketPrice, undefined);
    expect(result).toBe(marketPrice);
    expect(parseValueModule.parseValue).not.toHaveBeenCalled();
  });

  it("returns parseValue(triggerPrice, USD_DECIMALS) if isMarket is false and triggerPrice is present", () => {
    const marketPrice = BigNumber.from(1000);
    const result = getEntryPrice(false, marketPrice, "2000");
    expect(parseValueModule.parseValue).toHaveBeenCalledWith("2000", expect.any(Number));
    expect(result.eq(12345)).toBe(true);
  });
});

describe("getProfitPrice", () => {
  it("returns averagePrice for long (MIN_PROFIT_BIPS=0)", () => {
    const avg = BigNumber.from(1000);
    expect(getProfitPrice(true, avg).eq(avg)).toBe(true);
  });

  it("returns averagePrice for short (MIN_PROFIT_BIPS=0)", () => {
    const avg = BigNumber.from(2000);
    expect(getProfitPrice(false, avg).eq(avg)).toBe(true);
  });
});
