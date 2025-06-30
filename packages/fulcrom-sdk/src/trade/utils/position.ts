import { BigNumber } from "@ethersproject/bignumber";
import { BASIS_POINTS_DIVISOR } from "../../config";

export const getMarginFee = (
  sizeDelta: BigNumber,
  marginFeeBasisPoints: number,
) => {
  if (sizeDelta.eq(0)) return BigNumber.from(0);

  const afterFeeUsd = sizeDelta
    .mul(BASIS_POINTS_DIVISOR - marginFeeBasisPoints)
    .div(BASIS_POINTS_DIVISOR);

  return sizeDelta.sub(afterFeeUsd);
};