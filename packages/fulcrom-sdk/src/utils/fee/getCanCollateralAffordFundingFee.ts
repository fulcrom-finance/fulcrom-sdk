import type { BigNumber } from "@ethersproject/bignumber";

/**
 * @description
 * the user has a SOL position of size $58,277, at the block 15496473 when this user's adding collateral request getting executed by the keeper,
 * the protocol was going to charge funding fee of 8.042517066 SOL,
 * if the vault's poolAmount - reservedAmount plus the user collateral input is bigger than this funding fee,
 * the charge fee could be successful, however at that time,
 * the SOL poolAmount is 1193.364582049, reservedAmount is 1193.020570982.
 * poolAmount - reservedAmount is only 0.344011067 SOL,
 * plus the 1 SOL that user input, it even can't cover the funding fee. So the request was cancelled.
 *
 * ths can applied to
 *  - increase position input
 *  - deposit collateral input
 *
 * formula: user input collateral - swapFee - marginFee - depositFee + (poolAmount - reservedAmount) > fundingFee
 * unit: all USD or all token
 */
export const getCanCollateralAffordFundingFee = ({
  collateral,
  fundingFee,
  marginFee,
  poolAmount,
  reservedAmount,
  swapFee,
  depositFee,
}: {
  collateral: BigNumber;
  swapFee: BigNumber;
  marginFee: BigNumber;
  poolAmount: BigNumber;
  reservedAmount: BigNumber;
  fundingFee: BigNumber;
  depositFee: BigNumber;
}) => {
  return collateral.gt(
    getCollateralThreshold({
      depositFee,
      fundingFee,
      marginFee,
      poolAmount,
      reservedAmount,
      swapFee,
    })
  );
};
/**
 * user input collateral - swapFee - marginFee - depositFee + (poolAmount - reservedAmount) > fundingFee
 * user input collateral > fundingFee + swapFee + marginFee + depositFee - ( poolAmount - reservedAmount )
 */
export const getCollateralThreshold = ({
  fundingFee,
  marginFee,
  poolAmount,
  reservedAmount,
  swapFee,
  depositFee,
}: {
  swapFee: BigNumber;
  marginFee: BigNumber;
  poolAmount: BigNumber;
  reservedAmount: BigNumber;
  fundingFee: BigNumber;
  depositFee: BigNumber;
}) => {
  return fundingFee
    .add(swapFee)
    .add(marginFee)
    .add(depositFee)
    .sub(poolAmount.sub(reservedAmount));
};
