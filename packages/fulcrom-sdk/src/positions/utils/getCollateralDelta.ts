import { BigNumber } from "@ethersproject/bignumber";

import { getDelta } from "./getDelta";
import { getHasProfit } from "./getHasProfit";

import { ChainId } from "../../types";
import { getPositionFee } from "../../trade/utils/fees";
import { getIsClosing } from "./getIsClosing";
import { Position } from "../../types/position";
import { getEntryPrice } from "./getPrice";
import { BIG_NUM_ZERO } from "../../config/zero";

export const getCollateralDelta = async ({
  position,
  isMarket,
  decreaseAmount,
  triggerPrice,
  sizeDelta,
  chainId,
  isKeepLeverage,
  caches,
}: {
  position: Position;
  isMarket: boolean;
  decreaseAmount: string;
  triggerPrice?: string;
  sizeDelta: BigNumber;
  chainId: ChainId;
  isKeepLeverage: boolean;
  caches: Map<string, any>;
}): Promise<BigNumber> => {
  const {
    size,
    collateral,
    fundingFee,
    isLong,
    markPrice,
    averagePrice,
    lastIncreasedTime,
  } = position;

  const entryPrice = getEntryPrice(isMarket, markPrice, triggerPrice);

  const hasProfit = getHasProfit(isLong, entryPrice, averagePrice);

  const delta = getDelta(
    averagePrice,
    size,
    sizeDelta,
    lastIncreasedTime,
    entryPrice,
    hasProfit
  );

  const positionFee = await getPositionFee(chainId, sizeDelta, caches);
  const isClosing = getIsClosing(decreaseAmount, position);

  if (position.size.lte(0)) return BigNumber.from(0);
  if (isClosing) return BIG_NUM_ZERO; // 0 is required, else contract will breakdown @aaron

  const adjustedCollateral = collateral.mul(sizeDelta).div(size);

  const totalFees = positionFee.add(fundingFee);

  if (isKeepLeverage && hasProfit) {
    return delta.gt(totalFees)
      ? adjustedCollateral
      : adjustedCollateral.add(totalFees.sub(delta));
  } else if (isKeepLeverage && !hasProfit) {
    return adjustedCollateral.sub(delta).sub(totalFees);
  } else if (!isKeepLeverage && hasProfit) {
    return delta.gt(totalFees) ? BigNumber.from(0) : totalFees.sub(delta);
  } else {
    return delta;
  }
};
