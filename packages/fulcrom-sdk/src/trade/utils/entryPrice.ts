
import { TokenInfo } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { OrderType } from '../orders/types/orderType';

export const getEntryPrice = (
  toToken: TokenInfo,
  triggerPrice: BigNumber,
  orderType: OrderType,
  isLong: boolean,
) => {
  if (orderType === OrderType.Market) {
    return isLong ? toToken.maxPrice : toToken.minPrice;
  } else {
    // stop and limit
    return triggerPrice;
  }
};
