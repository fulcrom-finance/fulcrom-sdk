import { BigNumber } from "@ethersproject/bignumber";
import { limitDecimals } from "./limitDecimals";
import { parseUnits } from "@ethersproject/units";

export const parseValue = (
  value: string,
  decimals: number,
  defaultValue = BigNumber.from(0)
): BigNumber => {
  const pValue = Number.parseFloat(value);

  if (Number.isNaN(pValue)) return defaultValue;

  value = limitDecimals(value, decimals);
  const amount = parseUnits(value, decimals);

  return BigNumber.from(amount);
};
