import { UniswapV2 } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getCronosPool = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.UniswapV2>(
    getContractAddress('CronosFulPool', options.chainId),
    UniswapV2,
    options,
  );
};

export const getCronosCroPool = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.UniswapV2>(
    getContractAddress('CronosCroPool', options.chainId),
    UniswapV2,
    options,
  );
};
