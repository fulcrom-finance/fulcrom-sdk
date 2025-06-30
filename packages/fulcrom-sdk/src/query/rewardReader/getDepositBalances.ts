import type { BigNumber } from "@ethersproject/bignumber";
import { Address, ChainId } from "../../types";
import { getRewardReader } from "../../contracts/RewardReader";

export const getDepositBalances = async (
  account: Address,
  chainId: ChainId,
  depositTokens: Address[],
  rewardTrackers: Address[]
): Promise<BigNumber[]> => {
  const rewardReader = getRewardReader({ chainId });

  return await rewardReader.getDepositBalances(
    account,
    depositTokens,
    rewardTrackers
  );
};
