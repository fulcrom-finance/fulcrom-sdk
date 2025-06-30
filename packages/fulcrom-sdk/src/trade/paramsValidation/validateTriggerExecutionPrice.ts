import { USD_DECIMALS } from "../../config";
import { ValidationParams } from "../../types";
import { parseValue } from "../../utils/numbers/parseValue";
import { isLimitOrder, isStopMarket as checkIsStopMarket } from "../orders/types/orderType";
import { BigNumber } from "@ethersproject/bignumber";

export const validateTriggerExecutionPrice = (
  params: ValidationParams
): string[] => {
  const { triggerExecutionPrice, orderType, isLongPosition, toToken } = params;
  const errorMsg: string[] = [];

  const isLimit = isLimitOrder(orderType);
  const isStopMarket = checkIsStopMarket(orderType);
  // stop validating when it's no limit order
  if (!(isLimit || isStopMarket)) return errorMsg;

  if (!triggerExecutionPrice) {
    errorMsg.push("triggerExecutionPrice is required");
    return errorMsg;
  }

  const triggerPrice = parseValue(triggerExecutionPrice, USD_DECIMALS);
  if (triggerPrice.lte(0)) {
    errorMsg.push("triggerExecutionPrice must be greater than 0");
  }

  const toTokenEntryMarkPrice = isLongPosition
    ? toToken.maxPrice
    : toToken.minPrice;

  if (
    // long limit order
    isValidLongLimitOrder({
      isLimit,
      isLongPosition,
      toTokenEntryMarkPrice,
      triggerPrice,
    }) ||
    // short stop market order
    isValidShortStopMarketOrder({
      isStopMarket,
      isLongPosition,
      toTokenEntryMarkPrice,
      triggerPrice,
    })
  ) {
    // This needs to be below the market price
    errorMsg.push("triggerExecutionPrice needs to be below market price");
  }

  if (
    // short limit order
    isValidShortLimitOrder({
      isLimit,
      isLongPosition,
      toTokenEntryMarkPrice,
      triggerPrice,
    }) ||
    // long stop market order
    isValidLongStopMarketOrder({
      isStopMarket,
      isLongPosition,
      toTokenEntryMarkPrice,
      triggerPrice,
    })
  ) {
    // This needs to be above the market price
    errorMsg.push("triggerExecutionPrice needs to be above market price");
  }

  return errorMsg;
};

const isValidLongLimitOrder = ({
  isLimit,
  isLongPosition,
  toTokenEntryMarkPrice,
  triggerPrice,
}: {
  isLimit: boolean;
  isLongPosition: boolean;
  toTokenEntryMarkPrice: BigNumber;
  triggerPrice: BigNumber;
}): boolean => {
  return (
    isLimit &&
    isLongPosition &&
    toTokenEntryMarkPrice &&
    triggerPrice.gt(toTokenEntryMarkPrice)
  );
};

const isValidShortLimitOrder = ({
  isLimit,
  isLongPosition,
  toTokenEntryMarkPrice,
  triggerPrice,
}: {
  isLimit: boolean;
  isLongPosition: boolean;
  toTokenEntryMarkPrice: BigNumber;
  triggerPrice: BigNumber;
}): boolean => {
  return (
    isLimit &&
    !isLongPosition &&
    toTokenEntryMarkPrice &&
    triggerPrice.lt(toTokenEntryMarkPrice)
  );
};

const isValidLongStopMarketOrder = ({
  isStopMarket,
  isLongPosition,
  toTokenEntryMarkPrice,
  triggerPrice,
}: {
  isStopMarket: boolean;
  isLongPosition: boolean;
  toTokenEntryMarkPrice: BigNumber;
  triggerPrice: BigNumber;
}): boolean => {
  return (
    isStopMarket &&
    isLongPosition &&
    toTokenEntryMarkPrice &&
    triggerPrice.lt(toTokenEntryMarkPrice)
  );
};

const isValidShortStopMarketOrder = ({
  isStopMarket,
  isLongPosition,
  toTokenEntryMarkPrice,
  triggerPrice,
}: {
  isStopMarket: boolean;
  isLongPosition: boolean;
  toTokenEntryMarkPrice: BigNumber;
  triggerPrice: BigNumber;
}): boolean => {
  return (
    isStopMarket &&
    !isLongPosition &&
    toTokenEntryMarkPrice &&
    triggerPrice.gt(toTokenEntryMarkPrice)
  );
};
