import { validateLiquidation } from "../../../query/vaultUtils";
import { Address, ChainId, TokenInfo } from "../../../types";
import { Position } from "../../../types/position";

export const validateLiqStatus = async (params: {
  account: Address;
  chainId: ChainId;
  position: Position;
  isLongPosition: boolean;
  indexTokenInfo: TokenInfo;
}) => {
  const errorMsg: string[] = [];
  const liqStatus = await validateLiquidation({
    account: params.account,
    chainId: params.chainId,
    collateralToken: params.position.collateralToken,
    indexToken: params.position.indexToken,
    isLong: params.isLongPosition,
  });

  const liqPrice = params.position.liqPrice;
  const marketPrice = params.isLongPosition
    ? params.indexTokenInfo?.minPrice
    : params.indexTokenInfo?.maxPrice;

  const status =
    !liqStatus?.isZero() ||
    (marketPrice &&
      marketPrice.gt(0) &&
      // long / short liq with mark price compare
      (params.isLongPosition
        ? liqPrice.gte(marketPrice)
        : liqPrice.lte(marketPrice)));
  if (status) {
    errorMsg.push("Pending Liquidation");
  }
  return errorMsg;
};
