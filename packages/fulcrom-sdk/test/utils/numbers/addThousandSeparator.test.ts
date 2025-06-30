import { addThousandSeparator } from "../../../src/utils/numbers/addThousandSeparator";

describe("addThousandSeparator", () => {
  it("formats integer numbers as string", () => {
    expect(addThousandSeparator("1000")).toBe("1,000");
    expect(addThousandSeparator("1000000")).toBe("1,000,000");
    expect(addThousandSeparator("123")).toBe("123");
    expect(addThousandSeparator("0")).toBe("0");
    expect(addThousandSeparator("-1000000")).toBe(",-1,000,000");
  });

  it("formats integer numbers as number", () => {
    expect(addThousandSeparator(1000)).toBe("1,000");
    expect(addThousandSeparator(1000000)).toBe("1,000,000");
    expect(addThousandSeparator(123)).toBe("123");
    expect(addThousandSeparator(0)).toBe("0");
    expect(addThousandSeparator(-1000000)).toBe(",-1,000,000");
  });

  it("formats decimal numbers", () => {
    expect(addThousandSeparator("1234567.89")).toBe("1,234,567.89");
    expect(addThousandSeparator(1234567.89)).toBe("1,234,567.89");
    expect(addThousandSeparator("1000.00")).toBe("1,000.00");
    expect(addThousandSeparator("-1000.01")).toBe(",-1,000.01");
  });

  it("handles custom separator", () => {
    expect(addThousandSeparator(1000000, " ")).toBe("1 000 000");
    expect(addThousandSeparator("1234567.89", ".")).toBe("1.234.567.89");
  });

  it("handles empty string and non-numeric input", () => {
    expect(addThousandSeparator("")).toBe(",");
    expect(addThousandSeparator("abc")).toBe("a,b,c");
  });

  it("handles very large numbers", () => {
    expect(addThousandSeparator("123456789012345678901234567890")).toBe("123,456,789,012,345,678,901,234,567,890");
  });

  it("handles BigNumber input", () => {
    const mockBigNumber = { toString: () => "1234567890" };
    expect(addThousandSeparator(mockBigNumber as any)).toBe("1,234,567,890");
  });
});
