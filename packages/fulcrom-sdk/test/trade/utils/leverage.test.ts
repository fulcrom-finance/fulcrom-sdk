import { getLeverage } from "../../../src/trade/utils/leverage";

describe("getLeverage", () => {
  it("returns floored leverage * BASIS_POINTS_DIVISOR for decimal leverageRatio", () => {
    expect(getLeverage(2.5)).toBe(25000);
    expect(getLeverage(2.1234)).toBe(21234);
  });

  it("returns leverage * BASIS_POINTS_DIVISOR for integer leverageRatio", () => {
    expect(getLeverage(2)).toBe(20000);
    expect(getLeverage(1)).toBe(10000);
  });

  it("returns DEFAULT_LEVERAGE * BASIS_POINTS_DIVISOR if leverageRatio is undefined", () => {
    expect(getLeverage()).toBe(20000);
  });

  it("returns 0 if leverageRatio is 0", () => {
    expect(getLeverage(0)).toBe(0);
  });

  it("handles negative leverageRatio", () => {
    expect(getLeverage(-1.2)).toBe(-12000);
  });
});
