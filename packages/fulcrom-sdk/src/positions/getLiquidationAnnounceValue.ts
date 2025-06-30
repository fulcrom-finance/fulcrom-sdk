import { Position } from "../types/position";

export const getLiquidationAnnounceValue = (position: Position) => {
  /**
   *
   * Initial Collateral = Collateral (same as what on current UI) ->  { collateral } = position
   *
   * Unrealized PnL = PnL before fee (same as what on current UI) ->  { pendingDelta } = position
   *
   * Fees = Total Borrow Fee + Position Fee + Liquidation Fee
   *
   * Total Borrow Fee  = fundingFee, { fundingFee } = position
   *
   * Position Fee = positionFee, { positionFee } = position
   *
   * Liquidation Fee = 5 USD value
   *
   * remove the Liquidation Fee, since the Remaining Collateral stand for the amount that user will get when close position, which should not be included
   *
   */
  const { collateral, hasProfit, fundingFee, positionFee, pendingDelta } =
    position;

  if (!collateral || !pendingDelta || !fundingFee || !positionFee) {
    return undefined;
  } else {
    const unRealizedPnL = hasProfit ? pendingDelta : pendingDelta.mul(-1);

    return collateral.add(unRealizedPnL).sub(fundingFee).sub(positionFee);
  }
};
