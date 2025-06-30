import { BigNumber } from '@ethersproject/bignumber';

export function expandDecimals(decimals: number): BigNumber;
export function expandDecimals(n: number, decimals: number): BigNumber;
export function expandDecimals(n: number, decimals?: number): BigNumber {
  if (decimals === undefined) {
    decimals = Number(n);
    n = 1;
  }

  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals));
}
