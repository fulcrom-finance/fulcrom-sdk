import { isEvmAddress, validateEvmAddress } from "../../../src/trade/paramsValidation/validateAddress";

// Mock ethers.js isAddress
jest.mock("ethers", () => ({
  ethers: {
    utils: {
      isAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address),
    },
  },
}));

describe("isEvmAddress", () => {
  it("returns true for valid EVM address", () => {
    expect(isEvmAddress("0x1234567890123456789012345678901234567890")).toBe(true);
  });

  it("returns false for invalid EVM address", () => {
    expect(isEvmAddress("not-an-address")).toBe(false);
    expect(isEvmAddress("0x123")).toBe(false);
    expect(isEvmAddress("")).toBe(false);
  });
});

describe("validateEvmAddress", () => {
  it("does not push error for valid address", () => {
    const errors: string[] = [];
    validateEvmAddress("0x1234567890123456789012345678901234567890", errors);
    expect(errors).toEqual([]);
  });

  it("pushes error for invalid address", () => {
    const errors: string[] = [];
    validateEvmAddress("not-an-address", errors);
    expect(errors[0]).toMatch(/Invalid account address/);
  });
});
