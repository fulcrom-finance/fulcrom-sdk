import { LT_PREFIX } from '../../config';
import { getSmallestNonZeroNumericString } from './getSmallestNonZeroNumericString';
import type { HandleLessThanProps } from './types';

export function handleLessThanDefault({
  displayDecimals = 0,
  ltSymbol = LT_PREFIX,
  currencySymbol = '',
  isNegative,
  showPositiveSign,
}: HandleLessThanProps) {
  const positiveSign = showPositiveSign ? '+' : '';

  return (
    ltSymbol +
    ' ' +
    (isNegative ? '-' : positiveSign) +
    currencySymbol +
    getSmallestNonZeroNumericString(displayDecimals)
  );
}
