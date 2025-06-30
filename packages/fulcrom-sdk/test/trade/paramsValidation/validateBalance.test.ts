import { validateBalance } from "../../../src/trade/paramsValidation/validateBalance";

// Mock parseValue to use simple number logic for testing
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v: any) => ({
    gte: (x: number) => Number(v) >= x,
    toNumber: () => Number(v),
  }),
}));

describe("validateBalance", () => {
  const mockToken = (balance: number, decimals = 18) => ({
    balance: {
      gte: (amount: any) => balance >= (typeof amount === "object" && amount.toNumber ? amount.toNumber() : Number(amount)),
    },
    decimals,
  });

  it("returns [] if balance is sufficient", () => {
    expect(validateBalance(mockToken(100) as any, "50")).toEqual([]);
  });

  it("returns error if balance is insufficient", () => {
    expect(validateBalance(mockToken(10) as any, "50")).toContain("insufficient balance");
  });

  it("returns error if balance is missing", () => {
    expect(validateBalance({ decimals: 18 } as any, "50")).toContain("insufficient balance");
  });
});
