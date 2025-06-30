import { ERC20 } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getErc20 = (
  address: string,
  options: GetContractOptionsByChainId,
) => {
  return getContract<Contracts.ERC20>(address, ERC20, options);
};

export const getFul = (options: GetContractOptionsByChainId) => {
  return getErc20(getContractAddress('FUL', options.chainId), options);
};

/** Not Using */
export const getFlp = (options: GetContractOptionsByChainId) => {
  return getErc20(getContractAddress('FLP', options.chainId), options);
};

/** Not Using */
export const getEsFul = (options: GetContractOptionsByChainId) => {
  return getErc20(getContractAddress('ES_FUL', options.chainId), options);
};

/** Not Using */
export const getUsdg = (options: GetContractOptionsByChainId) => {
  return getErc20(getContractAddress('USDG', options.chainId), options);
};
