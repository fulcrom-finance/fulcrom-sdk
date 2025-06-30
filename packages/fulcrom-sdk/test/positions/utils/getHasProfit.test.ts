import { BigNumber } from "@ethersproject/bignumber";
import { getHasProfit } from "../../../src/positions/utils/getHasProfit";

describe("getHasProfit", () => {
  it("returns true for long when entryPrice > averagePrice", () => {
    expect(getHasProfit(true, BigNumber.from(2000), BigNumber.from(1500))).toBe(true);
  });

  it("returns false for long when entryPrice < averagePrice", () => {
    expect(getHasProfit(true, BigNumber.from(1500), BigNumber.from(2000))).toBe(false);
  });

  it("returns false for long when entryPrice == averagePrice", () => {
    expect(getHasProfit(true, BigNumber.from(2000), BigNumber.from(2000))).toBe(false);
  });

  it("returns true for short when entryPrice < averagePrice", () => {
    expect(getHasProfit(false, BigNumber.from(1500), BigNumber.from(2000))).toBe(true);
  });

  it("returns false for short when entryPrice > averagePrice", () => {
    expect(getHasProfit(false, BigNumber.from(2000), BigNumber.from(1500))).toBe(false);
  });

  it("returns false for short when entryPrice == averagePrice", () => {
    expect(getHasProfit(false, BigNumber.from(2000), BigNumber.from(2000))).toBe(false);
  });

  it("throws if entryPrice is not a BigNumber", () => {
    expect(() => getHasProfit(true, 2000 as any, BigNumber.from(1500))).toThrow();
  });

  it("throws if averagePrice is not a BigNumber", () => {
    expect(() => getHasProfit(true, BigNumber.from(2000), 1500 as any)).toThrow();
  });
});
