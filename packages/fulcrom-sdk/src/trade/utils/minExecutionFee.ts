import type { ChainId } from '../../types';
import { getOrderBook } from '../../contracts/OrderBook';
import { getPositionRouter } from '../../contracts/PositionRouter';
import { BigNumber } from "@ethersproject/bignumber";
import { expandDecimals } from '../../utils/numbers/expandDecimals';
import { CRO_DECIMALS } from '../../config/constants';

export const getOrderMinExecutionFee = async (chainId: ChainId): Promise<BigNumber> => {

  const minExecutionFee = await getOrderBook({ chainId }).minExecutionFee();

  // there's a bug in the SC,  as temporary get around, we add a small extract value
  // on top of the minExecutionFee read from the SC.
  return minExecutionFee.add(1);
}


export const getPositionMinExecutionFee = async (chainId: ChainId) => {
  return await getPositionRouter({ chainId }).minExecutionFee();
}


export const getPositionMinExecutionFeeUsd = async (chainId: ChainId): Promise<BigNumber | undefined> => {
  const positionExecutionFee = await getPositionMinExecutionFee(chainId);
  // TODO to getNativePrice
  //const  nativeTokenPrice  = getNativePrice();
  const nativeTokenPrice = 1000

  if (!positionExecutionFee || !nativeTokenPrice) return undefined;

  return positionExecutionFee.mul(nativeTokenPrice).div(expandDecimals(CRO_DECIMALS));
};
