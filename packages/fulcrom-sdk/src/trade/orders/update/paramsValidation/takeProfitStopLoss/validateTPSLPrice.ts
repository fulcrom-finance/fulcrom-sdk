import { IncreaseOrder } from "../../../../../query/graphql";
import { ChainId, TokenInfo } from "../../../../../types";
import { Position } from "../../../../../types/position";
import { getEditIncOrderLiqPrice } from "./getEditIncOrderLiqPrice";
import { getEditIncOrderNextEntryPrice } from "./getEditIncOrderNextEntryPrice";
import { getErrorMessage, InputType } from "./getErrorMessage";
import { getValidRange } from "./getValidRange";

export const validateTPSLPrice = async ({
  chainId,
  order,
  triggerExecutionPrice,
  transactionAmount,
  purchaseTokenInfo,
  takeProfitTargetPrice,
  stopLossTriggerPrice,
  position,
  caches,
}: {
  chainId: ChainId;
  order: IncreaseOrder;
  triggerExecutionPrice: string;
  transactionAmount: string;
  purchaseTokenInfo: TokenInfo;
  takeProfitTargetPrice?: string;
  stopLossTriggerPrice?: string;
  position?: Position;
  caches: Map<string, any>;
}) => {
  const errorMsg: string[] = [];

  const entryPrice = getEditIncOrderNextEntryPrice(
    order,
    triggerExecutionPrice,
    transactionAmount
  )?.toBigInt();
  const liquidationPrice = await getEditIncOrderLiqPrice({
    chainId,
    order,
    triggerExecutionPrice,
    transactionAmount,
    fromTokenInfo: purchaseTokenInfo,
    position,
    caches,
  });

  if (!entryPrice || !liquidationPrice) {
    return ["Invalid trigger price"];
  }

  if (takeProfitTargetPrice) {
    const validRange = getValidRange({
      entryPrice,
      isLong: order.isLong,
      isTakeProfit: true,
      liquidationPrice,
    });

    const error = getErrorMessage({
      validRange,
      price: takeProfitTargetPrice,
      type: InputType.TAKE_PROFIT,
    });

    if (error) {
      errorMsg.push(error);
    }
  }
  if (stopLossTriggerPrice) {
    const validRange = getValidRange({
      entryPrice,
      isLong: order.isLong,
      isTakeProfit: false,
      liquidationPrice,
    });
    const error = getErrorMessage({
      validRange,
      price: stopLossTriggerPrice,
      type: InputType.STOP_LOSS,
    });
    if (error) {
      errorMsg.push(error);
    }
  }
  return errorMsg;
};
