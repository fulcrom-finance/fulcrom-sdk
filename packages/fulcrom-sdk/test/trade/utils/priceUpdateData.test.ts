import { getPriceUpdateData } from "../../../src/trade/utils/priceUpdateData";

jest.mock("../../../src/config/tokens", () => ({
  getIndexTokenByAddressSafe: jest.fn(),
}));
jest.mock("../../../src/trade/utils/pyth/pythUpdateData", () => ({
  getPythUpdateData: jest.fn(),
}));

import { getIndexTokenByAddressSafe } from "../../../src/config/tokens";
import { getPythUpdateData } from "../../../src/trade/utils/pyth/pythUpdateData";

describe("getPriceUpdateData", () => {
  const chainId = 25 as any;
  const tokenA = "0xA";
  const tokenB = "0xB";
  const pythIdA = "pythA";
  const pythIdB = "pythB";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns pyth update data when all conditions are met and toTokenAddress is in path", async () => {
    (getIndexTokenByAddressSafe as jest.Mock)
      .mockImplementation((address) => {
        if (address === tokenA) return { pythTokenId: pythIdA };
        if (address === tokenB) return { pythTokenId: pythIdB };
        return undefined;
      });
    (getPythUpdateData as jest.Mock).mockResolvedValue(["data1", "data2"]);

    const result = await getPriceUpdateData(chainId, tokenA, true, [tokenA, tokenB]);
    // path = [tokenA, tokenB], toTokenAddress = tokenA (already in path)
    // pythTokenIds = [pythA, pythB]
    expect(getPythUpdateData).toHaveBeenCalledWith([pythIdA, pythIdB]);
    expect(result).toEqual(["data1", "data2"]);
  });

  it("returns pyth update data when toTokenAddress is not in path (should be added)", async () => {
    (getIndexTokenByAddressSafe as jest.Mock)
      .mockImplementation((address) => {
        if (address === tokenA) return { pythTokenId: pythIdA };
        if (address === tokenB) return { pythTokenId: pythIdB };
        return undefined;
      });
    (getPythUpdateData as jest.Mock).mockResolvedValue(["data1", "data2"]);

    const result = await getPriceUpdateData(chainId, tokenA, true, [tokenB]);
    // path = [tokenB], toTokenAddress = tokenA (not in path, so added)
    // pythTokenIds = [pythIdB, pythIdA]
    expect(getPythUpdateData).toHaveBeenCalledWith([pythIdB, pythIdA]);
    expect(result).toEqual(["data1", "data2"]);
  });

  it("returns undefined if isZkSync is false", async () => {
    (getIndexTokenByAddressSafe as jest.Mock).mockReturnValue({ pythTokenId: pythIdA });
    const result = await getPriceUpdateData(chainId, tokenA, false, [tokenA]);
    expect(result).toBeUndefined();
    expect(getPythUpdateData).not.toHaveBeenCalled();
  });

  it("returns undefined if path is empty", async () => {
    (getIndexTokenByAddressSafe as jest.Mock).mockReturnValue({ pythTokenId: pythIdA });
    const result = await getPriceUpdateData(chainId, tokenA, true, []);
    expect(result).toBeUndefined();
    expect(getPythUpdateData).not.toHaveBeenCalled();
  });

  it("returns undefined if any address is missing pythTokenId", async () => {
    (getIndexTokenByAddressSafe as jest.Mock)
      .mockImplementation((address) => {
        if (address === tokenA) return { pythTokenId: pythIdA };
        if (address === tokenB) return undefined;
        return undefined;
      });
    const result = await getPriceUpdateData(chainId, tokenA, true, [tokenA, tokenB]);
    expect(result).toBeUndefined();
    expect(getPythUpdateData).not.toHaveBeenCalled();
  });
});
