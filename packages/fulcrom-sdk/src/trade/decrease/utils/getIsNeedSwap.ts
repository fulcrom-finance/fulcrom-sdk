import { Token } from "../../../types";

export const getIsNeedSwap = ({
  isMarket,
  collateralToken,
  receiveToken,
}: {
  isMarket: boolean;
  collateralToken: Token;
  receiveToken: Token;
}) => {
  // swap is not allowed in limit order
  // for limit order, user will always receive the collateral token
  const isSwapAllowed = isMarket;

  return isSwapAllowed && collateralToken.address !== receiveToken.address;
};
