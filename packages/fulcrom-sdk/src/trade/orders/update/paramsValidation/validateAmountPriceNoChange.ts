import { BigNumber } from "@ethersproject/bignumber";
import { ONE_USD, USD_DECIMALS } from "../../../../config";
import { parseValue } from "../../../../utils/numbers/parseValue";
import { ValidationUpdateOrderParams } from "./checkIsEligibleToUpdateOrderOrder";
import { IncreaseOrder, OrderType } from "../../../../query/graphql";

export const validateAmountPriceNoChange = (
  params: ValidationUpdateOrderParams
) => {
  const { order, account, transactionAmount, triggerExecutionPrice, takeProfitTargetPrice, stopLossTriggerPrice } =
    params;
  if (!order || !account) return [];

  const errorMsg = [];

  const newTriggerPrice = BigNumber.isBigNumber(triggerExecutionPrice)
    ? triggerExecutionPrice
    : parseValue(triggerExecutionPrice, USD_DECIMALS);
  const triggerPriceChanged = newTriggerPrice.eq(order.triggerPrice);

  if (order.type === OrderType.DecreaseOrder) {
    const decreaseAmount = parseValue(transactionAmount, USD_DECIMALS)
    const amountChanged = decreaseAmount.gt(0) && decreaseAmount.lte(order.sizeDelta) && order.sizeDelta.sub(decreaseAmount).lt(ONE_USD);
    if (amountChanged && triggerPriceChanged) {
      errorMsg.push(
        "Price and Amount have no change, please input new value"
      );
    }
  }

  if (order.type === OrderType.IncreaseOrder) {
    const amountChanged = parseValue(transactionAmount, USD_DECIMALS).eq(order.sizeDelta);

    const takeProfitTargetPriceValue =
      takeProfitTargetPrice === undefined
        ? BigNumber.from(0)
        : parseValue(takeProfitTargetPrice, USD_DECIMALS);
    const takeProfitPriceChanged = takeProfitTargetPriceValue.eq((order as IncreaseOrder).tp);

    const stopLossTriggerPriceValue =
      stopLossTriggerPrice === undefined
        ? BigNumber.from(0)
        : parseValue(stopLossTriggerPrice, USD_DECIMALS);
    const stopLossPriceChanged = stopLossTriggerPriceValue.eq((order as IncreaseOrder).sl);

    if (amountChanged && triggerPriceChanged && takeProfitPriceChanged && stopLossPriceChanged) {
      errorMsg.push(
        "Price and Amount have no change, please input new value"
      );
    }
  }

  return errorMsg;
};