import { doTrimTrailingZeros } from "../../../src/utils/numbers/doTrimTrailingZeros";

describe("doTrimTrailingZeros", () => {
  it("removes trailing zeros after decimal", () => {
    expect(doTrimTrailingZeros("1.23000")).toBe("1.23");
    expect(doTrimTrailingZeros("100.1000")).toBe("100.1");
    expect(doTrimTrailingZeros("0.0000")).toBe("0");
    expect(doTrimTrailingZeros("123.450000")).toBe("123.45");
  });

  it("removes trailing decimal if present", () => {
    expect(doTrimTrailingZeros("1.")).toBe("1");
    expect(doTrimTrailingZeros("123.")).toBe("123");
  });

  it("leaves integers unchanged", () => {
    expect(doTrimTrailingZeros("123")).toBe("123");
    expect(doTrimTrailingZeros("0")).toBe("0");
    expect(doTrimTrailingZeros("1000")).toBe("1000");
  });

  it("handles numbers with no trailing zeros", () => {
    expect(doTrimTrailingZeros("1.23")).toBe("1.23");
    expect(doTrimTrailingZeros("100.1")).toBe("100.1");
  });

  it("handles edge cases", () => {
    expect(doTrimTrailingZeros("")).toBe("");
    expect(doTrimTrailingZeros("0.0")).toBe("0");
    expect(doTrimTrailingZeros("0.000")).toBe("0");
    expect(doTrimTrailingZeros("0.1000")).toBe("0.1");
    expect(doTrimTrailingZeros("0.001000")).toBe("0.001");
  });
});
