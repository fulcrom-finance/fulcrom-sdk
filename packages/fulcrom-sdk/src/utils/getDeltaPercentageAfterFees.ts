import { BASIS_POINTS_DIVISOR } from "../config";
import { BIG_NUM_ZERO } from "../config/zero";
import { BigNumber } from "@ethersproject/bignumber";

/**
 * PnL percentage
 */
export const getDeltaPercentageAfterFees = ({
  collateral,
  pendingDeltaAfterFees,
}: {
  collateral: BigNumber;
  pendingDeltaAfterFees: BigNumber;
}) => {
  return collateral.isZero()
    ? BIG_NUM_ZERO
    : (pendingDeltaAfterFees.mul(BASIS_POINTS_DIVISOR).div(collateral) ??
        BIG_NUM_ZERO);
};
