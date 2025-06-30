import { Pyth } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getPyth = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.IPyth>(
    getContractAddress('Pyth', options.chainId),
    Pyth,
    options,
  );
};
