import { getTokenFundingRate } from "../../src/positions/getTokenFundingRate";
import { BigNumber } from "@ethersproject/bignumber";
import { cacheKeys } from "../../src/cache";
import { ChainId } from "../../src/types";

// Mock getDataWithCache
jest.mock("../../src/cache", () => {
  const original = jest.requireActual("../../src/cache");
  return {
    ...original,
    getDataWithCache: jest.fn(),
    cacheKeys: original.cacheKeys,
  };
});

import { getDataWithCache } from "../../src/cache";

describe("getTokenFundingRate", () => {
  const token = "0xToken";
  const chainId: ChainId = 1 as ChainId;
  const caches = new Map();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns fundingRate and cumulativeFundingRate as BigNumbers when fundingRateMap is present", async () => {
    const fundingRate = "123";
    const cumulativeFundingRate = "456";
    (getDataWithCache as jest.Mock).mockResolvedValue({
      [token]: {
        fundingRate,
        cumulativeFundingRate,
      },
    });

    const result = await getTokenFundingRate(token, chainId, caches);

    expect(result.fundingRate).toBeDefined();
    expect(result.cumulativeFundingRate).toBeDefined();
    expect(result.fundingRate).toBeInstanceOf(BigNumber);
    expect(result.cumulativeFundingRate).toBeInstanceOf(BigNumber);
    expect(result.fundingRate!.toString()).toBe(fundingRate);
    expect(result.cumulativeFundingRate!.toString()).toBe(cumulativeFundingRate);
  });

  it("returns empty object when fundingRateMap is not present", async () => {
    (getDataWithCache as jest.Mock).mockResolvedValue(undefined);

    const result = await getTokenFundingRate(token, chainId, caches);

    expect(result).toEqual({});
  });
});
