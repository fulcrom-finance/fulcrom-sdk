import { formatUnits } from '@ethersproject/units';
import { STANDARD_DEFAULT_STRING } from '../../config/constants';
import { addThousandSeparator } from './addThousandSeparator';
import {
  DEFAULT_DECIMALS,
  DEFAULT_DISPLAY_DECIMALS,
  LT_PREFIX,
} from '../../config';
import { doTrimTrailingZeros } from './doTrimTrailingZeros';
import { getKmbInfo } from './getKmbInfo';
import { handleLessThanDefault } from './handleLessThanDefault';
import { isZero } from './isZero';
import { limitDecimals } from './limitDecimals';
import { padDecimals } from './padDecimals';
import type { AmountValue, FormatAmountOptions } from './types';

/**
 * @param value the type of value can be either a number, string, BigNumber or undefined.
 *   1. `value` can't be a float point value. If it' is a  float point value, formatAmount will throw.
 *      If `value` is a float point value, usually, you can use the `parseValue` to transfer it to a BigNumber first.
 *   2. if value is a number or string, make sure that value < Number.MAX_SAFE_INTEGER.
 *      If value >= Number.MAX_SAFE_INTEGER, formatAmount will throw.
 * @param options
 * @returns
 */
export const formatAmount = (
  value: AmountValue,
  {
    decimals = DEFAULT_DECIMALS,
    displayDecimals = DEFAULT_DISPLAY_DECIMALS,
    defaultValue = STANDARD_DEFAULT_STRING,
    trimTrailingZeros = false,
    kmbFormatThreshold,
    thousandSeparator = ',',
    round = false,
    smallValueMode = 'show-zero',
    currencySymbol = '',
    handleLessThan = handleLessThanDefault,
    showPositiveSign = false,
  }: FormatAmountOptions = {},
): string => {
  if (value === undefined || value.toString().length === 0) {
    return defaultValue;
  }

  let valueStr = value.toString();

  if (decimals !== 0) valueStr = formatUnits(value, decimals);

  let kmbUnit: string | undefined;

  if (kmbFormatThreshold) {
    const isNegative = valueStr.startsWith('-');
    const [integer, fraction] = valueStr.replaceAll('-', '').split('.');
    const { unit, decimalsOffset } = getKmbInfo(integer, kmbFormatThreshold);

    if (decimalsOffset) {
      // If value is suitable for KMB formatting, move the floating point to a proper position,
      // and re-use the same

      // e.g.
      // 10000 should be 10K,
      // then we can move the floating point 3 positions to the left, then we get 10.000,
      // then put it into the original formatting logic to get the formatted string,
      // finishing it up by appending the KMB unit to it.
      const cutoffIndex = integer.length - decimalsOffset;
      const intKmb = integer.substring(0, cutoffIndex);
      let fractionKmb = integer.substring(cutoffIndex) + fraction;
      fractionKmb = fractionKmb ? '.' + fractionKmb : '';

      valueStr = (isNegative ? '-' : '') + intKmb + fractionKmb;
      kmbUnit = unit;
    }
  }

  return (
    doFormatAmount(valueStr, {
      decimals: 0,
      displayDecimals,
      trimTrailingZeros,
      thousandSeparator,
      round,
      smallValueMode,
      currencySymbol,
      handleLessThan,
      showPositiveSign,
    }) + (kmbUnit ?? '')
  );
};

// This is the original `formatAmount` function but all parameters is required. For internal uses only.
// This allows the KMB formatting logic reuse the same formatting logic as the normal formatting.
const doFormatAmount = (
  value: Exclude<AmountValue, undefined>,
  {
    decimals,
    displayDecimals,
    trimTrailingZeros,
    thousandSeparator,
    round,
    smallValueMode,
    currencySymbol,
    handleLessThan,
    showPositiveSign,
  }: Required<Omit<FormatAmountOptions, 'kmbFormatThreshold' | 'defaultValue'>>,
): string => {
  let result: string;

  let valueStr = value.toString();

  if (decimals !== 0) valueStr = formatUnits(value, decimals);

  result = limitDecimals(valueStr, displayDecimals, round);

  if (trimTrailingZeros || displayDecimals === 0) {
    // trim tailing zeros
    result = doTrimTrailingZeros(result);
  } else {
    // pad tailing zeros;
    result = padDecimals(result, displayDecimals);
  }

  const isFormattedResultZero = isZero(result);
  const isNegative = valueStr.startsWith('-');

  // When small value mode is NOT `ShowZero` (the original behavior),
  // and the actual value string is not zero, but the formatted string is zero, meaning the value is too small for its formatting options
  if (
    smallValueMode !== 'show-zero' &&
    isFormattedResultZero &&
    !isZero(valueStr)
  ) {
    if (smallValueMode === 'show-less-than') {
      return handleLessThan({
        displayDecimals,
        ltSymbol: LT_PREFIX,
        currencySymbol,
        isNegative,
        valueString: valueStr,
        showPositiveSign,
      });
    }
  }

  const resultUnsigned = result.replace('-', '');
  const positiveSign = !isFormattedResultZero && showPositiveSign ? '+' : '';
  const prefix = (isNegative ? '-' : positiveSign) + currencySymbol;

  return (
    prefix +
    (thousandSeparator ? addThousandSeparator(resultUnsigned) : resultUnsigned)
  );
};
