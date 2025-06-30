import { USD_DECIMALS } from "../../../../../config";
import { IncreaseOrder } from "../../../../../query/graphql";
import { Position } from "../../../../../types/position";
import { parseValue } from "../../../../../utils/numbers/parseValue";
import { getEditIncOrderNextAveragePrice } from "./getEditIncOrderNextAveragePrice";

export const getEditIncOrderNextEntryPrice = (
  order: IncreaseOrder,
  newTriggerPrice: string,
  newSizeDelta: string,
  position?: Position
) => {
  const triggerPrice = parseValue(newTriggerPrice, USD_DECIMALS);
  const entryPrice = triggerPrice;
  const nextEntryPrice = getEditIncOrderNextAveragePrice(
    order,
    newTriggerPrice,
    newSizeDelta,
    position
  );
  const hasExistingPosition = !!position;
  const hasInput = triggerPrice.gt(0);
  const isShowNextAmount = hasExistingPosition && hasInput;
  if (isShowNextAmount) {
    return nextEntryPrice;
  } else {
    return entryPrice;
  }
};
