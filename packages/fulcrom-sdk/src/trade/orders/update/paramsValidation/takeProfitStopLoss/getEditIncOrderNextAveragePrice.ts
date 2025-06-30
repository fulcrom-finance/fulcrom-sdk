import { BigNumber } from "@ethersproject/bignumber";
import { IncreaseOrder } from "../../../../../query/graphql";
import { parseValue } from "../../../../../utils/numbers/parseValue";
import { USD_DECIMALS } from "../../../../../config";
import { Position } from "../../../../../types/position";
import { getPositionDelta } from "../../../../../orders/getPositionDelta";
import { getNextAveragePrice } from "../../../../../utils/position";

export const getEditIncOrderNextAveragePrice = (
  order: IncreaseOrder,
  newTriggerPrice: string,
  newSizeDelta: string,
  position?: Position
) => {
  const isLong = order.isLong;

  const triggerPrice = parseValue(newTriggerPrice, USD_DECIMALS);
  const toUsdMax = parseValue(newSizeDelta, USD_DECIMALS);

  if (!position) return undefined;

  const data = getPositionDelta(triggerPrice || BigNumber.from(0), position);

  return getNextAveragePrice({
    size: position.size,
    sizeDelta: toUsdMax,
    hasProfit: data.hasProfit,
    delta: data.delta,
    nextPrice: triggerPrice,
    isLong,
  });
};
