import { Router } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getRouter = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.Router>(
    getContractAddress('Router', options.chainId),
    Router,
    options,
  );
};
