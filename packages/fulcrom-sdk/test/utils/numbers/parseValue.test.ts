import { BigNumber } from "@ethersproject/bignumber";
import { parseValue } from "../../../src/utils/numbers/parseValue";

describe("parseValue", () => {
  it("parses integer string correctly", () => {
    expect(parseValue("123", 2)).toEqual(BigNumber.from("12300"));
    expect(parseValue("0", 6)).toEqual(BigNumber.from("0"));
    expect(parseValue("-42", 3)).toEqual(BigNumber.from("-42000"));
  });

  it("parses decimal string with less or equal decimals", () => {
    expect(parseValue("1.23", 2)).toEqual(BigNumber.from("123"));
    expect(parseValue("0.001", 6)).toEqual(BigNumber.from("1000"));
    expect(parseValue("-0.42", 3)).toEqual(BigNumber.from("-420"));
  });

  it("truncates extra decimals (no rounding)", () => {
    expect(parseValue("1.23456", 2)).toEqual(BigNumber.from("123"));
    expect(parseValue("0.123456", 4)).toEqual(BigNumber.from("1234"));
    expect(parseValue("-0.987654", 3)).toEqual(BigNumber.from("-987"));
  });

  it("returns defaultValue for invalid input", () => {
    const defaultVal = BigNumber.from(999);
    expect(parseValue("abc", 2)).toEqual(BigNumber.from(0));
    expect(parseValue("abc", 2, defaultVal)).toEqual(defaultVal);
    expect(parseValue("", 2)).toEqual(BigNumber.from(0));
    expect(parseValue(" ", 2)).toEqual(BigNumber.from(0));
  });

  it("handles very large and very small numbers", () => {
    expect(parseValue("123456789.987654321", 6)).toEqual(BigNumber.from("123456789987654"));
    expect(parseValue("0.000000123456", 12)).toEqual(BigNumber.from("123456"));
  });

  it("handles numbers with more decimals than allowed, truncating", () => {
    expect(parseValue("1.9999", 2)).toEqual(BigNumber.from("199"));
    expect(parseValue("1.9999", 3)).toEqual(BigNumber.from("1999"));
  });

  it("handles negative numbers", () => {
    expect(parseValue("-123.456", 2)).toEqual(BigNumber.from("-12345"));
    expect(parseValue("-0.0001", 6)).toEqual(BigNumber.from("-100"));
  });
});
