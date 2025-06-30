import { CircuitBreaker } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getCircuitBreaker = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.CircuitBreaker>(
    getContractAddress('CircuitBreaker', options.chainId),
    CircuitBreaker,
    options,
  );
};
