import { BigNumber } from "@ethersproject/bignumber";
import { adjustDecimals } from "../../../src/utils/numbers/adjustDecimals";

describe("adjustDecimals", () => {
  it("returns the same value if decimalsDiff is 0", () => {
    const value = BigNumber.from("1000");
    expect(adjustDecimals(value, 0).eq(value)).toBe(true);
  });

  it("multiplies value by 10^decimalsDiff if decimalsDiff > 0", () => {
    const value = BigNumber.from("2");
    expect(adjustDecimals(value, 3).eq(BigNumber.from("2000"))).toBe(true); // 2 * 10^3 = 2000
    expect(adjustDecimals(value, 6).eq(BigNumber.from("2000000"))).toBe(true); // 2 * 10^6 = 2000000
  });

  it("divides value by 10^abs(decimalsDiff) if decimalsDiff < 0", () => {
    const value = BigNumber.from("2000");
    expect(adjustDecimals(value, -3).eq(BigNumber.from("2"))).toBe(true); // 2000 / 10^3 = 2
    expect(adjustDecimals(value, -6).eq(BigNumber.from("0"))).toBe(true); // 2000 / 10^6 = 0
  });

  it("handles large numbers", () => {
    const value = BigNumber.from("12345678901234567890");
    expect(adjustDecimals(value, 2).eq(BigNumber.from("1234567890123456789000"))).toBe(true);
    expect(adjustDecimals(value, -2).eq(BigNumber.from("123456789012345678"))).toBe(true);
  });

  it("handles negative values", () => {
    const value = BigNumber.from("-1000");
    expect(adjustDecimals(value, 3).eq(BigNumber.from("-1000000"))).toBe(true);
    expect(adjustDecimals(value, -3).eq(BigNumber.from("-1"))).toBe(true);
  });
});
