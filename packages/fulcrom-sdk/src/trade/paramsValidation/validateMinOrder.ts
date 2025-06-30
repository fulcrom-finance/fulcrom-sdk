import { MIN_ORDER_USD } from "../../config";
import { TokenInfo } from "../../types";
import { formatAmountUsd } from "../../utils/numbers/formatAmountUsd";
import { parseValue } from "../../utils/numbers/parseValue";
import { getFromUsdMin } from "../utils/getFromUsdMin";

export const validateMinOrder = (
  fromToken: TokenInfo,
  transactionAmount: string
) => {
  const fromUsdMin = getFromUsdMin(
    fromToken,
    parseValue(transactionAmount, fromToken.decimals)
  );
  const errorMsg: string[] = [];

  if (fromUsdMin.lt(MIN_ORDER_USD)) {
    errorMsg.push(
      `Minimum order size is ${formatAmountUsd(MIN_ORDER_USD, {
        displayDecimals: 0,
      })} USD`
    );
  }
  return errorMsg;
};
