import { PositionRouter } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getPositionRouter = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.PositionRouter>(
    getContractAddress('PositionRouter', options.chainId),
    PositionRouter,
    options,
  );
};
