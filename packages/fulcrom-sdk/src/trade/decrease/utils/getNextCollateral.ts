import { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../../../types/position";
import { getCollateralDelta } from "../../../positions/utils/getCollateralDelta";
import { ChainId } from "../../../types";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { DecreaseOrder } from "../../../query/graphql";

export const getNextCollateral = async ({
  chainId,
  isMarket,
  position,
  isKeepLeverage,
  triggerPrice,
  decreaseAmount,
  isClosing,
  decreaseOrders,
  caches,
}: {
  position: Position;
  isClosing: boolean;
  isMarket: boolean;
  decreaseAmount: string;
  triggerPrice?: string;
  chainId: ChainId;
  isKeepLeverage: boolean;
  decreaseOrders: DecreaseOrder[];
  caches: Map<string, any>;
}): Promise<BigNumber> => {
  if (isClosing) return BigNumber.from(0);

  const sizeDelta = getSizeDelta(
    position,
    decreaseOrders,
    isMarket,
    decreaseAmount,
    triggerPrice
  );

  const collateralDelta = await getCollateralDelta({
    position,
    isMarket,
    decreaseAmount,
    triggerPrice,
    sizeDelta,
    chainId,
    isKeepLeverage,
    caches,
  });
  return position.collateral.sub(collateralDelta);
};
