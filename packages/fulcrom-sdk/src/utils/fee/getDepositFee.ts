import { BigNumber } from "@ethersproject/bignumber";
import { BASIS_POINTS_DIVISOR } from "../../config";
import { BIG_NUM_ZERO } from "../../config/zero";

const DEPOSIT_FEE_RATE = 0.003;
const DEPOSIT_FEE_RATE_WITH_OFFSET = BigNumber.from(
  DEPOSIT_FEE_RATE * BASIS_POINTS_DIVISOR
);
/**
 * if 'deposit into existing position' or 'increase position'
 *		if leverage decrease, and is Long position, user pay 0.3% of paying token amount as deposit fee
 *
 * Note that when depositing collateral into a long position, there is a 0.3% deposit fee for the conversion of the asset to its USD value, e.g. ETH amount to USD value. This is to prevent deposits from being used as a zero fee swap. This does not apply to shorts. This fee also does not apply when withdrawing collateral for longs or shorts.
 */
export const getDepositFee = ({
  userPayAmount,
  isLong,
  isLeverageDecreased,
}: {
  /**
   * deposit amount or purchase token amount
   */
  userPayAmount: BigNumber;
  isLong: boolean;
  isLeverageDecreased: boolean;
}) => {
  if (isLong && isLeverageDecreased) {
    return userPayAmount
      .mul(DEPOSIT_FEE_RATE_WITH_OFFSET)
      .div(BASIS_POINTS_DIVISOR);
  }

  return BIG_NUM_ZERO;
};
