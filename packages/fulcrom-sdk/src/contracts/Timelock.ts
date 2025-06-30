import { Timelock } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getTimelock = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.Timelock>(
    getContractAddress('Timelock', options.chainId),
    Timelock,
    options,
  );
};
