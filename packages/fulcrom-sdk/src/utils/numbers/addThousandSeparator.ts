import type { BigNumber } from '@ethersproject/bignumber';

export const addThousandSeparator = (
  n: string | number | BigNumber,
  separator = ',',
): string => {
  const parts = n.toString().split('.');

  // /\B(?=(\d{3})+(?!\d))/g is replaced by /\B(?=(\d{3}){0,15}(?!\d))/g to avoid catastrophic backtracking
  // 3 * 15 = 45, 45 digits should enough in this app considering USD uses 30 decimals
  parts[0] = parts[0].replace(/\B(?=(\d{3}){0,15}(?!\d))/g, separator);

  return parts.join('.');
};
