import { BigNumber } from "@ethersproject/bignumber";
import { USD_DECIMALS } from "../../../../config";
import { parseValue } from "../../../../utils/numbers/parseValue";
import { ValidationUpdateOrderParams } from "./checkIsEligibleToUpdateOrderOrder";
import { Position } from "../../../../types/position";
import { isDecreaseOrder } from "../../../../orders/getOrders";

export const validateTradeOrderPrice = (
  params: ValidationUpdateOrderParams
) => {
  const { order, account, indexTokenInfo, position, triggerExecutionPrice } =
    params;
  if (!order || !account) return [];

  const errorMsg = [];

  const newTriggerPrice = BigNumber.isBigNumber(triggerExecutionPrice)
    ? triggerExecutionPrice
    : parseValue(triggerExecutionPrice, USD_DECIMALS);

  const indexTokenMarkPrice = order.isLong
    ? indexTokenInfo?.maxPrice
    : indexTokenInfo?.minPrice;

  if (order.triggerAboveThreshold && indexTokenMarkPrice?.gt(newTriggerPrice))
    errorMsg.push(
      "Price below Mark Price, available range: >" + indexTokenMarkPrice
    );

  if (!order.triggerAboveThreshold && indexTokenMarkPrice?.lt(newTriggerPrice))
    errorMsg.push(
      "Price above Mark Price, available range: <" + indexTokenMarkPrice
    );

  if (position && isDecreaseOrder(order)) {
    const error = decreaseOrderCheck({ position, newTriggerPrice });
    if (error) errorMsg.push(error);
  }

  if (position && position.averagePrice.gt(0)) {
    const error = invalidPriceCheck({ position, newTriggerPrice });
    if (error) errorMsg.push(error);
  }

  return errorMsg;
};

const invalidPriceCheck = ({
  position,
  newTriggerPrice,
}: {
  position: Position;
  newTriggerPrice: BigNumber;
}) => {
  const hasProfit = position.isLong
    ? newTriggerPrice.gt(position.averagePrice)
    : newTriggerPrice.lt(position.averagePrice);
  const priceDelta = position.averagePrice.gt(newTriggerPrice)
    ? position.averagePrice.sub(newTriggerPrice)
    : newTriggerPrice.sub(position.averagePrice);
  const delta = position.size.mul(priceDelta).div(position.averagePrice);

  if (hasProfit && delta.eq(0)) return "Invalid price";
};

const decreaseOrderCheck = ({
  position,
  newTriggerPrice,
}: {
  position: Position;
  newTriggerPrice: BigNumber;
}) => {
  if (position.isLong && newTriggerPrice.lte(position.liqPrice))
    return "Price below Liq Price, available range: >" + position.liqPrice;

  if (!position.isLong && newTriggerPrice.gte(position.liqPrice))
    return `Price above Liq Price, available range: <${position.liqPrice}`;
};
