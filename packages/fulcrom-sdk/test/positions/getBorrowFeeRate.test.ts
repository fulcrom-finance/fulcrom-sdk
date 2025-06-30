import { getBorrowFeeRate } from "../../src/positions/getBorrowFeeRate";
import * as getTokenFundingRateModule from "../../src/positions/getTokenFundingRate";
import { FUNDING_RATE_PRECISION } from "../../src/config/constants";
import { ChainId } from "../../src/types";
import { BigNumber } from "ethers";

describe("getBorrowFeeRate", () => {
  const fundingRate = BigNumber.from(2);
  const size = BigNumber.from(10);

  const mockPosition = {
    collateralToken: "0xToken",
    size,
  };

  const chainId: ChainId = 1 as ChainId;
  const caches = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns correct borrow fee rate when fundingRate is present", async () => {
    jest.spyOn(getTokenFundingRateModule, "getTokenFundingRate").mockResolvedValue({
      fundingRate,
      cumulativeFundingRate: BigNumber.from(0),
    });

    const result = await getBorrowFeeRate(mockPosition as any, chainId, caches);

    // Calculation: fundingRate * size * 24 / FUNDING_RATE_PRECISION
    const expected = fundingRate.mul(size).mul(24).div(FUNDING_RATE_PRECISION);

    expect(result).toBeDefined();
    expect(result!.toString()).toBe(expected.toString());
  });

  it("returns undefined when fundingRate is falsy", async () => {
    jest.spyOn(getTokenFundingRateModule, "getTokenFundingRate").mockResolvedValue({
      fundingRate: undefined,
      cumulativeFundingRate: undefined,
    });

    const result = await getBorrowFeeRate(mockPosition as any, chainId, caches);

    expect(result).toBeUndefined();
  });
});
