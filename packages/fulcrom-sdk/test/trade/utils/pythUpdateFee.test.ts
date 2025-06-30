import { getPythUpdateFee } from "../../../src/trade/utils/pythUpdateFee";

jest.mock("../../../src/contracts/Pyth", () => ({
  getPyth: jest.fn(),
}));
jest.mock("../../../src/utils", () => ({
  getProvider: jest.fn(),
}));

import { getPyth } from "../../../src/contracts/Pyth";
import { getProvider } from "../../../src/utils";
import { BigNumber } from "@ethersproject/bignumber";

describe("getPythUpdateFee", () => {
  const chainId = 25 as any;
  const mockProvider = { getSigner: jest.fn() };
  const mockPyth = { getUpdateFee: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProvider as jest.Mock).mockReturnValue(mockProvider);
    (getPyth as jest.Mock).mockReturnValue(mockPyth);
  });

  it("returns update fee when pythUpdateData is non-empty", async () => {
    const updateData = ["foo", "bar"];
    const expectedFee = BigNumber.from(123);
    (mockPyth.getUpdateFee as jest.Mock).mockResolvedValue(expectedFee);

    const result = await getPythUpdateFee(chainId, updateData);

    expect(getProvider).toHaveBeenCalledWith(chainId);
    expect(getPyth).toHaveBeenCalledWith({
      signerOrProvider: mockProvider.getSigner(),
      chainId,
    });
    expect(mockPyth.getUpdateFee).toHaveBeenCalledWith(updateData);
    expect(result).toEqual(expectedFee);
  });

  it("returns undefined when pythUpdateData is empty", async () => {
    const result = await getPythUpdateFee(chainId, []);
    expect(result).toBeUndefined();
    expect(getProvider).toHaveBeenCalledWith(chainId);
    expect(getPyth).not.toHaveBeenCalled();
  });
});
