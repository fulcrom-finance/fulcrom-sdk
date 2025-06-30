import { BigNumber } from "@ethersproject/bignumber";
import { Position } from "../../../types/position";
import { getHasProfit } from "../../../positions/utils/getHasProfit";
import { getEntryPrice } from "../../../positions/utils/getPrice";
import { getIsClosing } from "../../../positions/utils/getIsClosing";
import { getSizeDelta } from "../../../positions/utils/getSizeDelta";
import { getDelta } from "../../../positions/utils/getDelta";
import { getPositionFee } from "../../utils/fees";
import { ChainId, TokenInfo } from "../../../types";
import { DecreaseOrder } from "../../../query/graphql";
import { expandDecimals } from "../../../config";

export const getReceiveUsd = async ({
  chainId,
  isMarket,
  decreaseAmount,
  position,
  isKeepLeverage,
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
  const isClosing = getIsClosing(decreaseAmount, position);
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
  const positionFee = await getPositionFee(chainId, sizeDelta, caches);

  if (position.size.lte(0)) return BigNumber.from(0);

  const adjustedCollateral = collateral.mul(sizeDelta).div(size);
  const totalFees = positionFee.add(fundingFee);

  if (isClosing) {
    const remaining = hasProfit
      ? collateral.add(delta).sub(totalFees)
      : collateral.sub(delta).sub(totalFees);

    return remaining.gt(0) ? remaining : BigNumber.from(0);
  }

  if (isKeepLeverage && hasProfit) {
    const remaining = adjustedCollateral.add(delta).sub(totalFees);

    return remaining.gt(0) ? remaining : BigNumber.from(0);
  } else if (isKeepLeverage && !hasProfit) {
    const remaining = adjustedCollateral.sub(delta).sub(totalFees);

    return remaining.gt(0) ? remaining : BigNumber.from(0);
  } else if (!isKeepLeverage && hasProfit) {
    return delta.gt(totalFees) ? delta.sub(totalFees) : BigNumber.from(0);
  } else {
    return BigNumber.from(0);
  }
};

export const getReceiveAmount = async ({
  chainId,
  receiveTokenInfo,
  isMarket,
  position,
  isKeepLeverage,
  triggerPrice,
  decreaseAmount,
  decreaseOrders,
  receiveUsd,
  caches,
}: {
  receiveTokenInfo: TokenInfo;
  chainId: ChainId;
  isMarket: boolean;
  position: Position;
  isKeepLeverage: boolean;
  triggerPrice?: string;
  decreaseAmount: string;
  decreaseOrders: DecreaseOrder[];
  receiveUsd?: BigNumber;
  caches: Map<string, any>;
}): Promise<BigNumber> => {
  const usd = receiveUsd
    ? receiveUsd
    : await getReceiveUsd({
        chainId,
        isMarket,
        position,
        isKeepLeverage,
        triggerPrice,
        decreaseAmount,
        decreaseOrders,
        caches,
      });

  if (receiveTokenInfo.maxPrice.lte(0)) return BigNumber.from(0);

  return usd
    .mul(expandDecimals(receiveTokenInfo.decimals))
    .div(receiveTokenInfo.maxPrice);
};

// export const getReceiveUsdAfterSwapFee = (): BigNumber => {
//   const receiveUsd = getReceiveUsd();
//   const swapFeeBps = getSwapFeeBps();

//   return receiveUsd
//     .mul(BASIS_POINTS_DIVISOR - swapFeeBps)
//     .div(BASIS_POINTS_DIVISOR);
// };

// export const getReceiveAmountAfterSwapFee = (): BigNumber => {
//   const receiveAmount = getReceiveAmount();
//   const swapFeeBps = getSwapFeeBps();

//   return receiveAmount
//     .mul(BASIS_POINTS_DIVISOR - swapFeeBps)
//     .div(BASIS_POINTS_DIVISOR);
// };
