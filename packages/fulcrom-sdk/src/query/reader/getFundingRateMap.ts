import { getContractAddress, getIndexTokens } from "../../config";
import { getReaderV2 } from "../../contracts/ReaderV2";
import { Address, ChainId } from "../../types";
import { BigNumber } from "@ethersproject/bignumber";

export type FundingRateMap = Record<
  Address,
  {
    // BigNum -> string because primitive type easier to cache
    fundingRate: string;
    cumulativeFundingRate: string;
  }
>;

const getFundingRateMap = (
  fundingRates: BigNumber[],
  tokenAddresses: Address[]
): FundingRateMap => {
  const propsLength = 2;

  const fundingRateMap = {} as FundingRateMap;

  for (let i = 0; i < tokenAddresses.length; i++) {
    fundingRateMap[tokenAddresses[i]] = {
      fundingRate: fundingRates[i * propsLength].toString(),
      cumulativeFundingRate: fundingRates[i * propsLength + 1].toString(),
    };
  }

  return fundingRateMap;
};

export const getFundingRateMapFn = async (chainId: ChainId) => {
  const vaultAddress = getContractAddress("Vault", chainId);
  const tokenAddresses = getIndexTokens(chainId).map((v) => v.address);

  const readerV2 = getReaderV2({ chainId });
  const wethAddress = getContractAddress("NATIVE_TOKEN", chainId);

  const res = await readerV2.getFundingRates(
    vaultAddress,
    wethAddress,
    tokenAddresses
  );

  return getFundingRateMap(res, tokenAddresses);
};
