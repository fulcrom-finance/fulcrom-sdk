import type { BigNumber } from '@ethersproject/bignumber';
import type { ChainId } from '../../types';
import { getErc20 } from '../../contracts/ERC20';
import type { Address } from '../../types';

export const getTotalSupply = async(chainId: ChainId,token:Address): Promise<BigNumber> => {
  
    const erc20 = getErc20(token, { chainId });

    const totalSupply = await erc20.totalSupply();

    return totalSupply;
  }

