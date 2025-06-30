import { ChainId } from "../types";

import { Position } from "../types/position";
import { getTokenFundingRate } from "./getTokenFundingRate";
import { FUNDING_RATE_PRECISION } from "../config/constants";

export const getBorrowFeeRate = async (
  data: Position,
  chainId: ChainId,
  caches: Map<string, any>
) => {
  const { fundingRate } = await getTokenFundingRate(
    data.collateralToken,
    chainId,
    caches
  );

  if (fundingRate) {
    const borrowFeeRate = fundingRate
      .mul(data.size)
      .mul(24)
      .div(FUNDING_RATE_PRECISION);
    return borrowFeeRate;
  }
};
