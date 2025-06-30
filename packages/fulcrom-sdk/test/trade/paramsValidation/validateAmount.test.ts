import { validateAmount } from "../../../src/trade/paramsValidation/validateAmount";

// Mock parseValue to use simple number logic for testing
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v: any) => ({
    lte: (x: number) => Number(v) <= x,
  }),
}));

const mockToken = { decimals: 18 };

describe("validateAmount", () => {
  it("returns [] if amount > 0", () => {
    expect(validateAmount("1", mockToken as any)).toEqual([]);
  });

  it("returns error if amount = 0", () => {
    expect(validateAmount("0", mockToken as any)).toContain(
      "transactionAmount must be greater than 0"
    );
  });

  it("returns error if amount < 0", () => {
    expect(validateAmount("-5", mockToken as any)).toContain(
      "transactionAmount must be greater than 0"
    );
  });
});
