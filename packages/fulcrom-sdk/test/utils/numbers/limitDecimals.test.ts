import { BigNumber } from "@ethersproject/bignumber";
import { limitDecimals } from "../../../src/utils/numbers/limitDecimals";

describe("limitDecimals", () => {
  it("returns original string if no maxDecimals is provided", () => {
    expect(limitDecimals("123.456")).toBe("123.456");
    expect(limitDecimals(42)).toBe("42");
    expect(limitDecimals(BigNumber.from("1000"))).toBe("1000");
  });

  it("truncates decimals when maxDecimals is set", () => {
    expect(limitDecimals("123.4567", 2)).toBe("123.45");
    expect(limitDecimals("0.123456", 4)).toBe("0.1234");
    expect(limitDecimals("-0.987654", 3)).toBe("-0.987");
    expect(limitDecimals("1.2", 4)).toBe("1.2");
    expect(limitDecimals("1", 2)).toBe("1");
  });

  it("rounds decimals when round=true", () => {
    expect(limitDecimals("123.4567", 2, true)).toBe("123.46");
    expect(limitDecimals("0.123456", 4, true)).toBe("0.1235");
    expect(limitDecimals("-0.987654", 3, true)).toBe("-0.988");
    expect(limitDecimals("1.2", 4, true)).toBe("1.2");
    expect(limitDecimals("1", 2, true)).toBe("1");
  });

  it("returns integer part if maxDecimals=0 and round=false", () => {
    expect(limitDecimals("123.4567", 0)).toBe("123");
    expect(limitDecimals("0.999", 0)).toBe("0");
    expect(limitDecimals("-42.1", 0)).toBe("-42");
  });

  it("rounds to integer if maxDecimals=0 and round=true", () => {
    expect(limitDecimals("123.6", 0, true)).toBe("124");
    expect(limitDecimals("0.5", 0, true)).toBe("1");
    expect(limitDecimals("-42.9", 0, true)).toBe("-43");
  });

  it("handles empty string and zero", () => {
    expect(limitDecimals("", 2)).toBe("");
    expect(limitDecimals("0", 2)).toBe("0");
    expect(limitDecimals(0, 2)).toBe("0");
  });

  it("handles BigNumber input", () => {
    expect(limitDecimals(BigNumber.from("123456789"), 2)).toBe("123456789");
    expect(limitDecimals(BigNumber.from("0"), 4)).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(limitDecimals("-123.456", 2)).toBe("-123.45");
    expect(limitDecimals("-0.0001", 3)).toBe("-0.000");
    expect(limitDecimals("-0.0001", 3, true)).toBe("0.000");
  });

  it("handles very large and very small numbers", () => {
    expect(limitDecimals("123456789.987654321", 6)).toBe("123456789.987654");
    expect(limitDecimals("0.000000123456", 8)).toBe("0.00000012");
    expect(limitDecimals("0.000000123456", 10, true)).toBe("NaN");
  });
});
