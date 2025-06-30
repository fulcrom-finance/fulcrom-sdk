import type { BigNumber } from '@ethersproject/bignumber';
import { PRECISION, USDG_DECIMALS } from '../../config/constants';
import type { TokenInfo } from '../../types';
import { adjustDecimals } from '../../utils/numbers/adjustDecimals';
import { getSwapFeeBps } from './swapFeeBps';
export const getMaxSwapFeeBps = ({
  fromAmount,
  fromTokenInfo,
  toTokenInfo,
  usdgSupply,
  totalWeight,
}: {
  fromAmount: BigNumber;
  fromTokenInfo: TokenInfo;
  toTokenInfo: TokenInfo;
  usdgSupply: BigNumber;
  totalWeight: BigNumber;
}): number => {
  const isStableSwap = fromTokenInfo.isStable && toTokenInfo.isStable;

  if (fromTokenInfo.address === toTokenInfo.address || !fromAmount.gt(0))
    return 0;

  const fromTokenMinPrice = fromTokenInfo.minPrice;

  const usdgAmount = adjustDecimals(
    fromAmount.mul(fromTokenMinPrice).div(PRECISION),
    USDG_DECIMALS - fromTokenInfo.decimals,
  );

  const feeBps0 = getSwapFeeBps({
    usdgAmount: fromTokenInfo.usdgAmount,
    weight: fromTokenInfo.weight,
    usdgDelta: usdgAmount,
    swapType: isStableSwap ? 'StableSwap' : 'Swap',
    isIncrement: true,
    usdgSupply,
    totalWeight: totalWeight,
  });


  const feeBps1 = getSwapFeeBps({
    usdgAmount: toTokenInfo.usdgAmount,
    weight: toTokenInfo.weight,
    usdgDelta: usdgAmount,
    swapType: isStableSwap ? 'StableSwap' : 'Swap',
    isIncrement: false,
    usdgSupply,
    totalWeight: totalWeight,
  });

  return Math.max(feeBps0, feeBps1);
};
