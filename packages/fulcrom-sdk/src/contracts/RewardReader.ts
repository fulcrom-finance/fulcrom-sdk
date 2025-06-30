import { RewardReader } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getRewardReader = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.RewardReader>(
    getContractAddress('RewardReader', options.chainId),
    RewardReader,
    options,
  );
};
