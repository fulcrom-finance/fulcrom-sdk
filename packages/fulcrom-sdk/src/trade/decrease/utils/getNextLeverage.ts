import { BigNumber } from "@ethersproject/bignumber";
import { getPositionLeverage } from "../../../utils/position";
import { ChainId } from "../../../types";
import { Position } from "../../../types/position";
import { getMarginFeeBasisPoints } from "../../../query/marginFeeBasisPoints";
import { getHasProfit } from "../../../positions/utils/getHasProfit";
import { DecreaseOrder } from "../../../query/graphql";
import { getEntryPrice } from "../../../positions/utils/getPrice";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { getDelta } from "../../../positions/utils/getDelta";
import { cacheKeys, getDataWithCache } from "../../../cache";

export const getNextLeverage = async ({
  chainId,
  isMarket,
  decreaseAmount,
  position,
  triggerPrice,
  decreaseOrders,
  caches,
}: {
  chainId: ChainId;
  isMarket: boolean;
  position: Position;
  isKeepLeverage: boolean;
  triggerPrice?: string;
  decreaseAmount: string;
  decreaseOrders: DecreaseOrder[];
  caches: Map<string, any>;
}): Promise<BigNumber> => {
  const { size, isLong, markPrice, averagePrice, lastIncreasedTime } = position;

  const entryPrice = getEntryPrice(isMarket, markPrice, triggerPrice);

  const hasProfit = getHasProfit(isLong, entryPrice, averagePrice);
  const sizeDelta = getSizeDelta(
    position,
    decreaseOrders,
    isMarket,
    decreaseAmount,
    triggerPrice
  );
  const delta = getDelta(
    averagePrice,
    size,
    sizeDelta,
    lastIncreasedTime,
    entryPrice,
    hasProfit
  );
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  return (
    getPositionLeverage(
      {
        size: position.size,
        sizeDelta,
        collateral: position.collateral,
        entryFundingRate: position.entryFundingRate,
        cumulativeFundingRate: position.cumulativeFundingRate,
        hasProfit,
        delta,
        isIncludeDelta: false,
        marginFeeBasisPoints,
      },
      chainId
    ) ?? BigNumber.from(0)
  );
};
