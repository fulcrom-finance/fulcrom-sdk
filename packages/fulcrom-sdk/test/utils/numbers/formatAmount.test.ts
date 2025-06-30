import { BigNumber } from "@ethersproject/bignumber";
import { formatAmount } from "../../../src/utils/numbers/formatAmount";
import { SmallValueMode } from "../../../src/utils/numbers/types";

describe("formatAmount", () => {
  it("returns default value for undefined or empty", () => {
    expect(formatAmount(undefined)).toBe("-");
    expect(formatAmount("")).toBe("-");
  });

  it("formats integer and decimal values with default options", () => {
    expect(formatAmount(123456, { decimals: 0 })).toBe("123,456.00");
    expect(formatAmount("1000", { decimals: 0 })).toBe("1,000.00");
    expect(formatAmount(BigNumber.from("5000"), { decimals: 0 })).toBe("5,000.00");
    expect(formatAmount(0, { decimals: 0 })).toBe("0.00");
    expect(formatAmount(-42, { decimals: 0 })).toBe("-42.00");
  });

  it("formats with custom decimals and displayDecimals", () => {
    expect(formatAmount(123456, { decimals: 3, displayDecimals: 1 })).toBe("123.4");
    expect(formatAmount("123456", { decimals: 2, displayDecimals: 3 })).toBe("1,234.560");
    expect(formatAmount(BigNumber.from("123456"), { decimals: 4, displayDecimals: 2 })).toBe("12.34");
  });

  it("trims trailing zeros when trimTrailingZeros is true", () => {
    expect(formatAmount(1000, { decimals: 0, trimTrailingZeros: true })).toBe("1,000");
    expect(formatAmount("123400", { decimals: 2, trimTrailingZeros: true })).toBe("1,234");
    expect(formatAmount("123450", { decimals: 2, trimTrailingZeros: true })).toBe("1,234.5");
  });

  it("pads zeros when trimTrailingZeros is false", () => {
    expect(formatAmount(1000, { decimals: 0, displayDecimals: 4, trimTrailingZeros: false })).toBe("1,000.0000");
    expect(formatAmount("1234", { decimals: 2, displayDecimals: 3, trimTrailingZeros: false })).toBe("12.340");
  });

  it("formats with thousand separator off", () => {
    expect(formatAmount(1000000, { decimals: 0, thousandSeparator: false })).toBe("1000000.00");
    expect(formatAmount("1234567", { decimals: 2, thousandSeparator: false })).toBe("12345.67");
  });

  it("formats with rounding", () => {
    expect(formatAmount(123456, { decimals: 3, displayDecimals: 1, round: true })).toBe("123.5");
    expect(formatAmount("123456", { decimals: 2, displayDecimals: 1, round: true })).toBe("1,234.6");
  });

  it("handles small value mode: show-zero", () => {
    expect(formatAmount("1", { decimals: 4, displayDecimals: 2, smallValueMode: SmallValueMode.ShowZero })).toBe("0.00");
  });

  it("handles small value mode: show-less-than", () => {
    expect(formatAmount("1", { decimals: 4, displayDecimals: 2, smallValueMode: SmallValueMode.ShowLessThan })).toContain("<");
  });

  it("formats with currency symbol and positive sign", () => {
    expect(formatAmount(1000, { decimals: 0, currencySymbol: "$" })).toBe("$1,000.00");
    expect(formatAmount(1000, { decimals: 0, showPositiveSign: true })).toBe("+1,000.00");
    expect(formatAmount(0, { decimals: 0, showPositiveSign: true })).toBe("0.00");
    expect(formatAmount(1000, { decimals: 0, currencySymbol: "€", showPositiveSign: true })).toBe("+€1,000.00");
    expect(formatAmount(-1000, { decimals: 0, currencySymbol: "€", showPositiveSign: true })).toBe("-€1,000.00");
  });

  it("formats large numbers with KMB formatting", () => {
    expect(formatAmount(1000000, { decimals: 0, kmbFormatThreshold: 1e6 })).toContain("M");
    expect(formatAmount(1000000000, { decimals: 0, kmbFormatThreshold: 1e9 })).toContain("B");
    expect(formatAmount(10000, { decimals: 0, kmbFormatThreshold: 1e3 })).toContain("K");
  });

  it("handles bigint input", () => {
    expect(formatAmount(BigInt(1000000), { decimals: 0 })).toBe("1,000,000.00");
  });

  it("handles negative and zero values", () => {
    expect(formatAmount(-123456, { decimals: 0 })).toBe("-123,456.00");
    expect(formatAmount(0, { decimals: 0 })).toBe("0.00");
  });
});
