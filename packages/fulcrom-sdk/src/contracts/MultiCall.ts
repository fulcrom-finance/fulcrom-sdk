import { MultiCall } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getMultiCall = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.MultiCall>(
    getContractAddress('MultiCall', options.chainId),
    MultiCall,
    options,
  );
};
