import { getPyth } from '../../contracts/Pyth';
import { getProvider } from '../../utils';

import { ChainId } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';

export const getPythUpdateFee = async (
  chainId: ChainId,
  pythUpdateData: string[]
): Promise<BigNumber | undefined> => {
  const provider = getProvider(chainId);

  if (pythUpdateData.length > 0) {
    const pyth = getPyth({
      signerOrProvider: provider?.getSigner(),
      chainId: chainId,
    });
    return pyth.getUpdateFee(pythUpdateData);
  }
  return undefined;
};
