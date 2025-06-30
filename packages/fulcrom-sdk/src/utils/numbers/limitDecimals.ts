import { BigNumber } from "@ethersproject/bignumber";

import { roundDecimals } from "./roundDecimals";

export const limitDecimals = (
  value: string | number | BigNumber,
  maxDecimals?: number,
  round?: boolean
): string => {
  let valueStr = value.toString();

  if (!value) return valueStr;
  if (maxDecimals === undefined) return valueStr;
  if (maxDecimals === 0 && !round) return valueStr.split(".")[0] || "";

  const dotIndex = valueStr.indexOf(".");

  if (dotIndex === -1) return valueStr;

  const decimals = valueStr.length - dotIndex - 1;

  if (decimals > maxDecimals) {
    if (round) {
      /**
       *  assume the value here is within the safe integer range
       *  and can accept small degree of precision loss
       */
      valueStr = roundDecimals(Number(valueStr), maxDecimals);
    } else {
      valueStr = valueStr.substring(
        0,
        valueStr.length - (decimals - maxDecimals)
      );
    }
  }

  return valueStr;
};
