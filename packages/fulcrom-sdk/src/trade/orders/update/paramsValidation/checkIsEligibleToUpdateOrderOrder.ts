import { OrderType, TradeOrder } from "../../../../query/graphql";
import { TokenInfo, UpdateOrderRequest } from "../../../../types";
import { Position } from "../../../../types/position";
import { validateDecreaseAmount } from "../../../decrease/paramsValidation/validateDecreaseAmount";
import { validateLiqStatus } from "../../../decrease/paramsValidation/validateLiqStatus";
import { validatePrice } from "../../../decrease/paramsValidation/validatePrice";
import { validateTPSLPrice } from "./takeProfitStopLoss/validateTPSLPrice";
import { validateAmountPriceNoChange } from "./validateAmountPriceNoChange";
import { validateSizeDelta } from "./validateSizeDelta";
import { validateTradeOrderPrice } from "./validateTradeOrderPrice";

export type ValidationUpdateOrderParams = Omit<UpdateOrderRequest, "order"> & {
  position?: Position;
  order: TradeOrder;
  purchaseTokenInfo: TokenInfo;
  indexTokenInfo: TokenInfo;
  collateralTokenInfo: TokenInfo;
  caches: Map<string, any>;
};

export const checkIsEligibleToUpdateOrderOrder = async (
  params: ValidationUpdateOrderParams
) => {
  const { order, position, triggerExecutionPrice, indexTokenInfo } = params;
  if (order.type === OrderType.DecreaseOrder) {
    if (!position) {
      return ["Position is not found"];
    }

    const validators = [
      validatePrice({
        position,
        triggerExecutionPrice,
        indexTokenInfo,
      }),
      validateLiqStatus({
        account: params.account,
        chainId: params.chainId,
        position,
        isLongPosition: order.isLong,
        indexTokenInfo,
      }),
      validateDecreaseAmount({
        account: params.account,
        receiveTokenInfo: params.indexTokenInfo,
        position,
        isMarket: false,
        isKeepLeverage: true,
        chainId: params.chainId,
        triggerExecutionPrice,
        decreaseAmount: params.transactionAmount,
        decreaseOrders: [order],
        collateralTokenInfo: params.collateralTokenInfo,
        caches: params.caches,
      }),
      validateAmountPriceNoChange({...params, order}),
    ];

    const messages = await Promise.allSettled(validators);
    const errorMessages = messages
      .filter((message) => {
        return message.status === "fulfilled";
      })
      .flatMap((message) => message.value);

    return errorMessages;
  }
  if (order.type === OrderType.IncreaseOrder) {
    const validators = [
      validateSizeDelta({ ...params, order }),
      validateTradeOrderPrice(params),
      validateTPSLPrice({ ...params, order }),
      validateAmountPriceNoChange({...params, order}),
    ];

    const messages = await Promise.allSettled(validators);
    const errorMessages = messages
      .filter((message) => {
        return message.status === "fulfilled";
      })
      .flatMap((message) => message.value);

    return errorMessages;
  }
  return [];
};
