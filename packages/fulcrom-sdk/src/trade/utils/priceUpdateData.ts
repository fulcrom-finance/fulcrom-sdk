import { getIndexTokenByAddressSafe } from '../../config/tokens';
import { getPythUpdateData } from './pyth/pythUpdateData';
import { ChainId } from '../../types';

export const getPriceUpdateData = async (
  chainId: ChainId,
  toTokenAddress: string,
  isZkSync: boolean,
  path: string[],
): Promise<string[] | undefined> => {

  const pythUpdateTokens = [...path];

  if (!path.includes(toTokenAddress)) {
    pythUpdateTokens.push(toTokenAddress);
  }
  const pythTokenIds = pythUpdateTokens
    .map(
      (tokenAddress) =>
        getIndexTokenByAddressSafe(tokenAddress, chainId)?.pythTokenId,
    )
    .filter((id): id is string => !!id);

  const enabled = isZkSync && path.length > 0 && pythTokenIds.length === pythUpdateTokens.length;

  if (enabled) {
    return await getPythUpdateData(pythTokenIds)
  }

  return undefined;
};
