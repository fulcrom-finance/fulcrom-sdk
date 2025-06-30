import type { BigNumber } from '@ethersproject/bignumber';

import type { MIN_KMB_THRESHOLD } from '../../config';

export type KmbFormatThreshold = typeof MIN_KMB_THRESHOLD | 1e6 | 1e9;

// length of the integer part of a number
export const ThresholdLengthMap: Record<KmbFormatThreshold, number> = {
  [1e3]: 4,
  [1e6]: 7,
  [1e9]: 10,
};

export type AmountValue = string | number | BigNumber | bigint | undefined;

export enum SmallValueMode {
  ShowZero = 'show-zero', // does what original formatAmount does
  ShowLessThan = 'show-less-than',
}

export type FormatAmountOptions = {
  /**
   * @description
   * assume the value here is within the safe integer range and can accept small degree of precision loss
   */
  round?: boolean;
  decimals?: number;
  /**
   * @description
   * how many decimals should be displayed, default to 2
   * examples:
   *   100.1234 => 100.12
   *   100.12999 => 100.12
   */
  displayDecimals?: number;
  /**
   * @description
   * the fallback value to be used when the input amount is undefined or the input amount is not valid number
   */
  defaultValue?: string;
  /**
   * @description
   * whether to remove the decimal trailing zero
   * examples:
   *   100.10 => 100.1;
   *   100.10100 => 100.101;
   */
  trimTrailingZeros?: boolean;
  /**
   * @description
   * whether to display the separator thousandSeparator is enabled by default pass false to disable thousandSeparator
   * examples:
   *   1000.1234 => 1,000.1234
   *   1000000.1234 => 1,000,000.1234
   */
  thousandSeparator?: string | false;
  /**
   * @description
   * whether to enable the K, M, B formatter
   * examples:
   *   1000 => 1k
   *   10000 => 10k
   *   1000000 => 1M
   *   1000000000 => 1B
   */
  kmbFormatThreshold?: KmbFormatThreshold;
  currencySymbol?: string;
  /**
   * @description
   * `smallValueMode` determines how to handle when a formatted value becomes 0 because of formatting but is not actually 0
   * `show-zero` - show zero
   * `show-less-than` - show `< x.xx`
   */
  smallValueMode?: SmallValueMode | `${SmallValueMode}`;
  handleLessThan?: (props: HandleLessThanProps) => string;
  /**
   * @description
   * if `true`, e.g. 10 -> +10
   */
  showPositiveSign?: boolean;
};

export interface HandleLessThanProps {
  displayDecimals: number;
  ltSymbol: string;
  currencySymbol?: string;
  isNegative: boolean;
  valueString: string;
  showPositiveSign: boolean;
}
