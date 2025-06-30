import { BigNumber } from '@ethersproject/bignumber';
import {
  MINT_BURN_FEE_BASIS_POINTS,
  STABLE_SWAP_FEE_BASIS_POINTS,
  STABLE_TAX_BASIS_POINTS,
  SWAP_FEE_BASIS_POINTS,
  TAX_BASIS_POINTS,
} from '../../config/constants';

export type SwapType = 'Swap' | 'StableSwap' | 'FlpSwap';

export const getSwapFeeBps = ({
  swapType,
  usdgDelta,
  isIncrement,
  usdgSupply,
  usdgAmount,
  weight,
  totalWeight,
}: {
  swapType: SwapType;
  usdgDelta: BigNumber;
  isIncrement: boolean;
  usdgAmount: BigNumber;
  usdgSupply: BigNumber;
  weight: BigNumber;
  totalWeight: BigNumber;
}): number => {

  const initialSwapFeeBps = BigNumber.from(
    swapType === 'StableSwap'
      ? STABLE_SWAP_FEE_BASIS_POINTS
      : swapType === 'FlpSwap'
        ? MINT_BURN_FEE_BASIS_POINTS
        : SWAP_FEE_BASIS_POINTS,
  ); 

  const initialTaxBps = BigNumber.from(
    swapType === 'StableSwap' ? STABLE_TAX_BASIS_POINTS : TAX_BASIS_POINTS,
  ); 

  const initialAmount = usdgAmount; 
  const targetAmount = totalWeight.gt(0)
    ? weight.mul(usdgSupply).div(totalWeight)
    : BigNumber.from(0); 

  let nextAmount = initialAmount.add(usdgDelta); 

  if (!isIncrement) {
    nextAmount = usdgDelta.gt(initialAmount)
      ? BigNumber.from(0)
      : initialAmount.sub(usdgDelta); 
  }

  if (targetAmount.eq(0)) return initialSwapFeeBps.toNumber();

  const initialDiff = initialAmount.gt(targetAmount)
    ? initialAmount.sub(targetAmount)
    : targetAmount.sub(initialAmount); 

  const nextDiff = nextAmount.gt(targetAmount)
    ? nextAmount.sub(targetAmount)
    : targetAmount.sub(nextAmount); 

  if (nextDiff.lt(initialDiff)) {
    const rebateBps = initialTaxBps.mul(initialDiff).div(targetAmount);

    return rebateBps.gt(initialSwapFeeBps)
      ? 0
      : initialSwapFeeBps.sub(rebateBps).toNumber();
  } 

  
  let averageDiff = initialDiff.add(nextDiff).div(2); 

 
  if (averageDiff.gt(targetAmount)) averageDiff = targetAmount;

  const taxBps = initialTaxBps.mul(averageDiff).div(targetAmount); 

  return initialSwapFeeBps.add(taxBps).toNumber();
};
