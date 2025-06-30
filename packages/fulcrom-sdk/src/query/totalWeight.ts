import { BigNumber } from '@ethersproject/bignumber';
import { getVaultV2 } from '../contracts/VaultV2';
import { ChainId } from '../types';

export const getTotalWeight = async (chainId: ChainId): Promise<BigNumber> => {
  const vaultV2 = getVaultV2({ chainId });
  const response = await vaultV2.totalTokenWeights();

  return response;
};
