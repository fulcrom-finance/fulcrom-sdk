import { Vault } from '../abis';
import { getContractAddress } from '../config';
import type { Contracts } from '../types';
import type { GetContractOptionsByChainId } from '../utils';
import { getContract } from '../utils';

export const getVaultV2 = (options: GetContractOptionsByChainId) => {
  return getContract<Contracts.VaultV2>(
    getContractAddress('Vault', options.chainId),
    Vault,
    options,
  );
};
