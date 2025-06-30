import { BigNumber } from "@ethersproject/bignumber";
import { expandDecimals } from "../../../src/utils/numbers/expandDecimals";

describe("expandDecimals", () => {
  it("returns 1 * 10^decimals when called with one argument", () => {
    expect(expandDecimals(0).eq(BigNumber.from(1))).toBe(true);
    expect(expandDecimals(2).eq(BigNumber.from(100))).toBe(true);
    expect(expandDecimals(6).eq(BigNumber.from(1000000))).toBe(true);
  });

  it("returns n * 10^decimals when called with two arguments", () => {
    expect(expandDecimals(2, 3).eq(BigNumber.from(2000))).toBe(true); // 2 * 10^3 = 2000
    expect(expandDecimals(5, 0).eq(BigNumber.from(5))).toBe(true);
    expect(expandDecimals(0, 5).eq(BigNumber.from(0))).toBe(true);
  });

  it("handles large decimals", () => {
    expect(expandDecimals(1, 18).eq(BigNumber.from("1000000000000000000"))).toBe(true);
    expect(expandDecimals(2, 18).eq(BigNumber.from("2000000000000000000"))).toBe(true);
  });

  it("handles negative n", () => {
    expect(expandDecimals(-2, 3).eq(BigNumber.from(-2000))).toBe(true);
  });
});
