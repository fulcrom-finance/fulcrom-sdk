import { BigNumber } from "@ethersproject/bignumber";
import { Address, ChainId } from "../types";
import { getFundingRateMapFn } from "../query/reader/getFundingRateMap";
import { cacheKeys, getDataWithCache } from "../cache";

export const getTokenFundingRate = async (
  token: Address,
  chainId: ChainId,
  caches: Map<string, any>
) => {
  const fundingRateMap = await getDataWithCache(
    caches,
    cacheKeys.FundingRateMap,
    getFundingRateMapFn,
    chainId
  );
  if (!fundingRateMap) return {};

  return {
    fundingRate: BigNumber.from(fundingRateMap[token].fundingRate),
    cumulativeFundingRate: BigNumber.from(
      fundingRateMap[token].cumulativeFundingRate
    ),
  };
};
