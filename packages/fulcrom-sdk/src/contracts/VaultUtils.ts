import { VaultUtils } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getVaultUtils = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.VaultUtils>(
    getContractAddress('VaultUtils', options.chainId),
    VaultUtils,
    options,
  );
};
