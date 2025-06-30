import { isZero } from "../../../src/utils/numbers/isZero";

describe("isZero", () => {
  it("returns true for only zeros", () => {
    expect(isZero("0")).toBe(true);
    expect(isZero("00")).toBe(true);
    expect(isZero("0.0")).toBe(true);
    expect(isZero("0.000")).toBe(true);
    expect(isZero("000.000")).toBe(true);
    expect(isZero("-0")).toBe(true);
    expect(isZero("-0.0")).toBe(true);
  });

  it("returns true for empty string or just dot", () => {
    expect(isZero("")).toBe(true);
    expect(isZero(".")).toBe(true);
    expect(isZero("000.")).toBe(true);
  });

  it("returns false for any nonzero digit", () => {
    expect(isZero("1")).toBe(false);
    expect(isZero("0.1")).toBe(false);
    expect(isZero("10")).toBe(false);
    expect(isZero("0.0001")).toBe(false);
    expect(isZero("000.0002")).toBe(false);
    expect(isZero("-0.03")).toBe(false);
  });

  it("returns true for strings with no digits 1-9", () => {
    expect(isZero("abc")).toBe(true);
    expect(isZero("0abc")).toBe(true);
    expect(isZero("0.0e0")).toBe(true);
    expect(isZero(" ")).toBe(true);
    expect(isZero("0 0")).toBe(true);
  });

  it("returns true for large zero strings", () => {
    expect(isZero("0".repeat(1000))).toBe(true);
    expect(isZero("0".repeat(1000) + ".000")).toBe(true);
  });
});
