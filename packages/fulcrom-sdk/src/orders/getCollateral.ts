import { TradeOrder } from "../query/graphql";
import { TokenInfo } from "../types";
import { Position } from "../types/position";
import { getOrderCollateralUsdValue } from "./getOrderCollateralUsdValue";

export const getCollateral = ({
  order,
  position,
  collateralTokenInfo,
}: {
  order: TradeOrder;
  position?: Position;
  collateralTokenInfo: TokenInfo;
}) => {
  const from = position?.collateral;
  const to = getOrderCollateralUsdValue({
    order,
    position,
    collateralTokenInfo,
  });

  return {
    from: from ? from : undefined,
    to: to ? to : undefined,
  };
};
