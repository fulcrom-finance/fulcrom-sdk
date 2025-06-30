import type { BigNumber } from "@ethersproject/bignumber";
import { formatAmount } from "./numbers/formatAmount";

/**
 * @example
 * // 0.000123
 * getFirstNonZeroDecimalsIndex(123000,9) => 4
 * formatAmount(123000,{decimals:9,displayDecimals:4}) => 0.0001
 */
export const getNonZeroDecimalsPlaces = (
  number: string | number | BigNumber | bigint,
  tokenDecimals: number,
  maxDecimals = 10
) => {
  const decimalNumber = formatAmount(number, {
    decimals: tokenDecimals,
    displayDecimals: maxDecimals,
  });

  const [_, decimalsDigits] = decimalNumber.split(".");
  const diffIndex = decimalsDigits.split("").findIndex((d) => d !== "0");

  return diffIndex + 1;
};
