import { BigNumber } from '@ethersproject/bignumber';
import { ChainId } from '../../types';
import { getOrderMinExecutionFee } from './minExecutionFee';

export const getTpSlFinalExecutionFee = async (
  isStopLossPriceEnabled: boolean,
  isTakeProfitPriceEnabled: boolean,
  orderBookMinExecutionFee: BigNumber
): Promise<BigNumber> => {

  /** orderbook minExecutionFee - with tp sl adding
   * Case 1: tp enabled, sl disabled, only include orderBookMinExecutionFee * 1
   * Case 2: tp disabled, sl enabled, only include orderBookMinExecutionFee * 1
   * Case 3: tp and sl both are enabled, include orderBookMinExecutionFee * 2
   * case 4: tp and sl both are disabled, DO NOT include orderBookMinExecution
   */

  if (!orderBookMinExecutionFee) return BigNumber.from(0);
  let finalExecutionFee = BigNumber.from(0);

  if (isStopLossPriceEnabled) {
    finalExecutionFee = finalExecutionFee.add(orderBookMinExecutionFee);
  }

  if (isTakeProfitPriceEnabled) {
    finalExecutionFee = finalExecutionFee.add(orderBookMinExecutionFee);
  }

  return finalExecutionFee;

};
