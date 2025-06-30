import type { BigNumber } from "@ethersproject/bignumber";
import { getIsClosing } from "./getIsClosing";
import { Position } from "../../types/position";
import { DecreaseOrder } from "../../query/graphql";
import { getExistingDecreaseOrders } from "../../orders/getExistingOrders";
import { ORDER_SIZE_DUST_USD, USD_DECIMALS } from "../../config";
import { parseValue } from "../../utils/numbers/parseValue";

export const getSizeDelta = (
  position: Position,
  decreaseOrders: DecreaseOrder[],
  isMarket: boolean,
  decreaseAmount: string,
  triggerPrice?: string
): BigNumber => {
  const isClosing = getIsClosing(decreaseAmount, position);
  const fromUsd = parseValue(decreaseAmount, USD_DECIMALS);
  const existingOrders = getExistingDecreaseOrders({
    isMarket,
    triggerPriceValue: triggerPrice,
    position,
    decreaseOrders,
  });

  const { size } = position;

  if (isClosing) return size;

  if (!isMarket && fromUsd.gt(0) && existingOrders.length > 0) {
    let residualSize = position.size;

    for (const order of existingOrders)
      residualSize = residualSize.sub(order.sizeDelta);

    // if the position size is 100 USD
    // close order 1 => sizeDelta 30USD
    // close order 2 => sizeDelta 40USD
    // current sizeDelta => 29.93 USD(user inputted)
    // we want to force set the sizeDelta to 30USD to avoid dust order
    if (residualSize.sub(fromUsd).abs().lt(ORDER_SIZE_DUST_USD))
      return residualSize;
  }

  return fromUsd;
};
