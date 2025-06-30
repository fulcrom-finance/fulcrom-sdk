import { validateHistoryParams } from "../../../src/trade/history/validateHistoryParams";
import { ChainId } from "../../../src/types";
import { TradingEventAction } from "../../../src/query/graphql/getTradingEvents";

// Mock validateEvmAddress to only check for a simple 0x address
jest.mock("../../../src/trade/paramsValidation/validateAddress", () => ({
  validateEvmAddress: (address: string, errors: string[]) => {
    if (typeof address !== "string" || !address.startsWith("0x") || address.length !== 42) {
      errors.push(`Invalid account address: ${address}`);
    }
  },
}));

describe("validateHistoryParams", () => {
  const validAccount = "0x1234567890123456789012345678901234567890";
  const validChainId = ChainId.CRONOS_MAINNET; // Use any valid ChainId
  const validFilters = [TradingEventAction.CreateIncreasePosition, TradingEventAction.CreateDecreasePosition];
  const validPagination = { page: 1, limit: 20 };

  it("returns [] for valid input", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
      pagination: validPagination,
    });
    expect(errors).toEqual([]);
  });

  it("returns error for invalid chainId", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: 999999 as any,
      filters: validFilters,
      pagination: validPagination,
    });
    expect(errors).toContain("Invalid chainId: 999999");
  });

  it("returns error for invalid account address", () => {
    const errors = validateHistoryParams({
      account: "not-an-address",
      chainId: validChainId,
      filters: validFilters,
      pagination: validPagination,
    });
    expect(errors).toContain("Invalid account address: not-an-address");
  });

  it("returns error for filters not being an array", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: "not-an-array" as any,
      pagination: validPagination,
    });
    expect(errors[0]).toMatch(/Invalid filters:/);
  });

  it("returns error for filters containing invalid value", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: [TradingEventAction.CreateIncreasePosition, "INVALID_ACTION"] as any,
      pagination: validPagination,
    });
    expect(errors[0]).toMatch(/Invalid filters:/);
  });

  it("returns error for negative page", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
      pagination: { page: -1, limit: 20 },
    });
    expect(errors).toContain("Invalid page: -1, must be a number greater than 0");
  });

  it("returns error for zero limit", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
      pagination: { page: 1, limit: 0 },
    });
    expect(errors).toContain("Invalid limit: 0, must be a number greater than 0");
  });

  it("returns error for non-number page", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
      pagination: { page: "one" as any, limit: 20 },
    });
    expect(errors).toContain("Invalid page: one, must be a number greater than 0");
    expect(errors).toContain("Invalid page: one. Expected a number value.");
  });

  it("returns error for non-number limit", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
      pagination: { page: 1, limit: "twenty" as any },
    });
    expect(errors).toContain("Invalid limit: twenty, must be a number greater than 0");
    expect(errors).toContain("Invalid limit: twenty. Expected a number value.");
  });

  it("returns [] when pagination is omitted (should use default)", () => {
    const errors = validateHistoryParams({
      account: validAccount,
      chainId: validChainId,
      filters: validFilters,
    });
    expect(errors).toEqual([]);
  });

  it("returns multiple errors for multiple invalid fields", () => {
    const errors = validateHistoryParams({
      account: "bad",
      chainId: ChainId.CRONOS_MAINNET,
      filters: ["BAD"] as any,
      pagination: { page: 0, limit: -1 },
    });
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain("Invalid account address: bad");
    expect(errors.some(e => e.startsWith("Invalid filters:"))).toBe(true);
    expect(errors).toContain("Invalid page: 0, must be a number greater than 0");
    expect(errors).toContain("Invalid limit: -1, must be a number greater than 0");
  });
});
