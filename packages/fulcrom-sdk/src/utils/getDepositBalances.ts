import type { BigNumber } from "@ethersproject/bignumber";
import { getContractAddress } from "../config";
import { Address, ChainId } from "../types";
import { getDepositBalances } from "../query/rewardReader/getDepositBalances";

export const queryDepositBalances = async ({
  chainId,
  account,
}: {
  chainId: ChainId;
  account: Address;
}) => {
  const depositTokens = [
    getContractAddress("FUL", chainId),
    getContractAddress("ES_FUL", chainId),
    getContractAddress("StakedFulTracker", chainId),
    getContractAddress("BonusFulTracker", chainId),
    getContractAddress("BN_FUL", chainId),
    getContractAddress("FLP", chainId),
  ];

  const rewardTrackers = [
    getContractAddress("StakedFulTracker", chainId),
    getContractAddress("StakedFulTracker", chainId),
    getContractAddress("BonusFulTracker", chainId),
    getContractAddress("FeeFulTracker", chainId),
    getContractAddress("FeeFulTracker", chainId),
    getContractAddress("FeeFlpTracker", chainId),
  ];

  const data = await getDepositBalances(
    account,
    chainId,
    depositTokens,
    rewardTrackers
  );
  if (data.length !== 0) return formatDepositBalances(data);
};

export type DepositBalances = ReturnType<typeof formatDepositBalances>;

export const formatDepositBalances = (depositBalances: BigNumber[]) => {
  const keys = [
    "fulInStakedFul",
    "esFulInStakedFul",
    "stakedFulInBonusFul",
    "bonusFulInFeeFul",
    "bnFulInFeeFul",
    "flpInStakedFlp",
  ] as const;

  const data = {} as Record<(typeof keys)[number], BigNumber>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = depositBalances[i];
  }

  return data;
};
