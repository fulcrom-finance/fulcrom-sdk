import { Token } from "../../types";

export const getIsNeedSwap = ({
  isLong,
  fromToken,
  toTokenInfo,
  collateralTokenInfo,
}: {
  isLong: boolean;
  fromToken: Token;
  toTokenInfo: Token;
  collateralTokenInfo: Token;
}) => {
  const isNeedSwapForLong = isLong && fromToken.address !== toTokenInfo.address;

  const isNeedSwapForShort =
    !isLong && fromToken.address !== collateralTokenInfo.address;

  return isNeedSwapForLong || isNeedSwapForShort;
};
