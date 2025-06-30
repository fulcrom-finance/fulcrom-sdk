import { validateMinOrder } from "../../../src/trade/paramsValidation/validateMinOrder";

// Mock dependencies
import { BigNumber } from "@ethersproject/bignumber";
jest.mock("../../../src/utils/numbers/parseValue", () => ({
  parseValue: (v: any) => BigNumber.from(v),
}));
jest.mock("../../../src/utils/numbers/formatAmountUsd", () => ({
  formatAmountUsd: (v: any) => String(v),
}));
jest.mock("../../../src/trade/utils/getFromUsdMin", () => ({
  getFromUsdMin: jest.fn((fromToken, amount) => BigNumber.from(amount)),
}));
jest.mock("../../../src/config", () => ({
  MIN_ORDER_USD: 100,
}));

const mockToken = { decimals: 18 };

describe("validateMinOrder", () => {
  it("returns [] if order is above minimum", () => {
    expect(validateMinOrder(mockToken as any, "200")).toEqual([]);
  });

  it("returns error if order is below minimum", () => {
    expect(validateMinOrder(mockToken as any, "50")[0]).toMatch(/Minimum order size is 100 USD/);
  });

  it("returns error if order is exactly at minimum", () => {
    expect(validateMinOrder(mockToken as any, "100")).toEqual([]);
  });
});
