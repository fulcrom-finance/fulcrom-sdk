import { BigNumber } from '@ethersproject/bignumber';
import { getTpSlFinalExecutionFee } from './tpslFinalExecutionFee';
import { ChainId } from '../../types';
import { cacheKeys, getDataWithCache } from '../../cache';
import { getOrderMinExecutionFee, getPositionMinExecutionFee } from './minExecutionFee';


export const getPositionFinalExecutionFee = async (
  chainId: ChainId,
  isStopLossPriceEnabled: boolean,
  isTakeProfitPriceEnabled: boolean,
  caches: Map<string, any>
): Promise<BigNumber> => {
  // position minExecutionFee
  const positionMinExecutionFee = await getDataWithCache<BigNumber, [ChainId]>(
    caches,
    cacheKeys.PositionMinExecutionFee,
    getPositionMinExecutionFee,
    chainId
  );

    // order minExecutionFee
    const orderMinExecutionFee = await getDataWithCache<BigNumber, [ChainId]>(
      caches,
      cacheKeys.OrderMinExecutionFee,
      getOrderMinExecutionFee,
      chainId
    );

  // tpsl final execution fee
  const tpSlFinalExecutionFee = await getTpSlFinalExecutionFee(isStopLossPriceEnabled, isTakeProfitPriceEnabled,orderMinExecutionFee);

  if (!positionMinExecutionFee || !tpSlFinalExecutionFee)
    return BigNumber.from(0);
  else {
    return tpSlFinalExecutionFee.add(positionMinExecutionFee);
  }
};
