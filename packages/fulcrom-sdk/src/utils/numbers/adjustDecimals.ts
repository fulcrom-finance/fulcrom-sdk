import type { BigNumber } from '@ethersproject/bignumber';

import { expandDecimals } from './expandDecimals';

export const adjustDecimals = (
  value: BigNumber,
  decimalsDiff: number,
): BigNumber => {
  if (decimalsDiff === 0) return value;

  if (decimalsDiff > 0) return value.mul(expandDecimals(decimalsDiff));

  return value.div(expandDecimals(-decimalsDiff));
};
