import { validateChainIdAndAccount } from "../../src/positions/validateChainIdAndAccount";
import { ChainId } from "../../src/types";

// Mock validateEvmAddress
jest.mock("../../src/trade/paramsValidation/validateAddress", () => ({
  validateEvmAddress: jest.fn((account: string, errors: string[]) => {
    if (account === "0xINVALID") {
      errors.push("Invalid address");
    }
  }),
}));

describe("validateChainIdAndAccount", () => {
  const validChainId = Object.values(ChainId)[0] as ChainId;
  const invalidChainId = 999999 as ChainId;

  it("returns no errors for valid chainId and address", () => {
    const errors = validateChainIdAndAccount("0x1234567890123456789012345678901234567890", validChainId);
    expect(errors).toEqual([]);
  });

  it("returns error for invalid chainId", () => {
    const errors = validateChainIdAndAccount("0x1234567890123456789012345678901234567890", invalidChainId);
    expect(errors).toContain(`Invalid chainId: ${invalidChainId}`);
  });

  it("returns error for invalid address", () => {
    const errors = validateChainIdAndAccount("0xINVALID", validChainId);
    expect(errors).toContain("Invalid address");
  });

  it("returns both errors for invalid chainId and address", () => {
    const errors = validateChainIdAndAccount("0xINVALID", invalidChainId);
    expect(errors).toContain(`Invalid chainId: ${invalidChainId}`);
    expect(errors).toContain("Invalid address");
  });
});
