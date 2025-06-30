import { getPosition } from "../../../positions/getPosition";
import { ValidationParams } from "../../../types";
import {
  getErrorMessage,
  InputType,
} from "../../orders/update/paramsValidation/takeProfitStopLoss/getErrorMessage";
import { getValidRange } from "../../orders/update/paramsValidation/takeProfitStopLoss/getValidRange";
import { getLiquidationPrice } from "./getLiquidationPrice";
import { getNextEntryPrice } from "./getNextEntryPrice";

export const validateTakeProfitStopLossPrice = async ({
  chainId,
  account,
  triggerExecutionPrice,
  transactionAmount,
  fromToken,
  toToken,
  isLongPosition,
  collateralTokenInfo,
  orderType,
  takeProfitTargetPrice,
  stopLossTriggerPrice,
  leverageRatio,
  caches,
}: ValidationParams) => {
  const errorMsg: string[] = [];

  const existingPosition = await getPosition({
    account: account,
    toToken: toToken.address,
    chainId: chainId,
    isLong: isLongPosition,
    collateralTokenAddress: collateralTokenInfo.address,
    caches,
  });
  const entryPrice = (
    await getNextEntryPrice({
      chainId,
      triggerExecutionPrice,
      transactionAmount,
      fromToken,
      toToken,
      isLongPosition,
      collateralTokenInfo,
      existingPosition,
      orderType,
      leverageRatio,
      caches,
    })
  )?.toBigInt();
  const liquidationPrice = await getLiquidationPrice({
    chainId,
    triggerExecutionPrice,
    transactionAmount,
    fromToken,
    toToken,
    isLongPosition,
    collateralTokenInfo,
    existingPosition,
    orderType,
    leverageRatio,
    caches,
  });

  if (!entryPrice || !liquidationPrice) {
    return ["Invalid trigger price"];
  }
  if (takeProfitTargetPrice) {
    const validRange = getValidRange({
      entryPrice,
      isLong: isLongPosition,
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
      isLong: isLongPosition,
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
