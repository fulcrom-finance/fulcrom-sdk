import { validateAllowedSlippageAmount } from "../../../src/trade/paramsValidation/validateAllowedSlippage";

// Mock config values
jest.mock("../../../src/config", () => ({
  MIN_SLIPPAGE_BASIS_POINTS: 5,
  MAX_SLIPPAGE_BASIS_POINTS: 1000,
}));

describe("validateAllowedSlippageAmount", () => {
  it("does nothing if isMarket is false", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(0, false, errors);
    expect(errors).toEqual([]);
  });

  it("pushes error if value is null for market order", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(null as any, true, errors);
    expect(errors[0]).toMatch(/cannot be null/);
  });

  it("pushes error if value is below min", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(1, true, errors);
    expect(errors[0]).toMatch(/must be between/);
  });

  it("pushes error if value is above max", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(2000, true, errors);
    expect(errors[0]).toMatch(/must be between/);
  });

  it("does not push error if value is in range", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(100, true, errors);
    expect(errors).toEqual([]);
  });

  it("pushes both errors if value is null and is out of range", () => {
    const errors: string[] = [];
    validateAllowedSlippageAmount(null as any, true, errors);
    // Only the null error is pushed, since the range check is skipped if value is null
    expect(errors.length).toBe(2);
  });
});
