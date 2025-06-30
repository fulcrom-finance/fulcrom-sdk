import { TokenInfo } from "../../types";
import { parseValue } from "../../utils/numbers/parseValue";

export const validateBalance = (
  fromToken: TokenInfo,
  transactionAmount: string
): string[] => {
  const amount = parseValue(transactionAmount, fromToken.decimals);
  const errorMsg = [];

  // insufficient balance validation
  if (!fromToken.balance?.gte(amount)) {
    errorMsg.push("insufficient balance");
  }

  return errorMsg;
};
