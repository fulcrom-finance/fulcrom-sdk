import { BigNumber } from "@ethersproject/bignumber";
import { BASIS_POINTS_DIVISOR } from "../../config";
import { ChainId } from "../../types";
import { TokenInfo } from "../../types";
import { getFromUsdMin } from "./getFromUsdMin";
import { getOrderSwapFeeBps } from "./tradeOrderSwapFeeBps";
import { getMarginFeeBasisPoints } from "../../query/marginFeeBasisPoints";
import { getMarginFee } from "./position";
import { cacheKeys, getDataWithCache } from "../../cache";

export const getSwapFee = async (
  chainId: ChainId,
  isLong: boolean,
  fromAmount: BigNumber,
  fromTokenInfo: TokenInfo,
  shortCollateralTokenInfo: TokenInfo,
  toTokenInfo: TokenInfo,
  caches: Map<string, any>
): Promise<BigNumber> => {
  const fromUsdMin = getFromUsdMin(fromTokenInfo, fromAmount);

  const swapFeeBps = await getOrderSwapFeeBps(
    chainId,
    isLong,
    fromAmount,
    fromTokenInfo,
    shortCollateralTokenInfo,
    toTokenInfo,
    caches
  );

  return fromUsdMin.mul(swapFeeBps).div(BASIS_POINTS_DIVISOR);
};

export const getPositionFee = async (
  chainId: ChainId,
  sizeDelta: BigNumber,
  caches: Map<string, any>
): Promise<BigNumber> => {
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );

  const positionFee = getMarginFee(sizeDelta, marginFeeBasisPoints);

  return positionFee;
};

export const getTotalFees = async (
  chainId: ChainId,
  isLong: boolean,
  fromAmount: BigNumber,
  fromTokenInfo: TokenInfo,
  shortCollateralTokenInfo: TokenInfo,
  toTokenInfo: TokenInfo,
  sizeDelta: BigNumber,
  caches: Map<string, any>
): Promise<bigint> => {
  const swapFee = await getSwapFee(
    chainId,
    isLong,
    fromAmount,
    fromTokenInfo,
    shortCollateralTokenInfo,
    toTokenInfo,
    caches
  );
  const positionFee = await getPositionFee(chainId, sizeDelta, caches);

  return swapFee.add(positionFee).toBigInt();
};
