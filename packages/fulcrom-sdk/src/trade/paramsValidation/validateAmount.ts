import { TokenInfo } from "../../types";
import { parseValue } from "../../utils/numbers/parseValue";
export const validateAmount = (
  transactionAmount: string,
  fromToken: TokenInfo
): string[] => {
  const amount = parseValue(transactionAmount, fromToken.decimals);
  const errorMsg: string[] = [];

  if (amount.lte(0)) {
    errorMsg.push("transactionAmount must be greater than 0");
  }

  return errorMsg;
};
