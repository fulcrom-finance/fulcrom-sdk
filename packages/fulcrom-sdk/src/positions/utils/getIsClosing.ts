
import { USD_DECIMALS } from '../../config';
import { getIsFullClose } from '../../orders/getIsFullClose';
import { Position } from '../../types/position';
import { parseValue } from '../../utils/numbers/parseValue';

export const getIsClosing = (decreaseAmount: string, position: Position) => {
  const fromUsd = parseValue(decreaseAmount,USD_DECIMALS);
  // fully close the position when the remaining position size is less than 1 USD.
  return getIsFullClose(position, {
    sizeDelta: fromUsd,
  });
};
