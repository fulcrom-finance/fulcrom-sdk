import { BASIS_POINTS_DIVISOR, DEFAULT_LEVERAGE } from "../../config";

export const getLeverage = (leverageRatio?: number): number => {
  const leverageValue = leverageRatio ?? DEFAULT_LEVERAGE;
  // remove decimal fraction otherwise BigNumber.from() will throw error in some cases
  return Math.floor(leverageValue * BASIS_POINTS_DIVISOR);
};
