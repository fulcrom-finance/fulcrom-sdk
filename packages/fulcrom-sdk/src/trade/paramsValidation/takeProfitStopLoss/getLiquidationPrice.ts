import { USD_DECIMALS } from "../../../config";
import { BIG_NUM_ZERO } from "../../../config/zero";
import { getFixedLiquidationFeeUsd } from "../../../query/vault/getFixedLiquidationFeeUsd";
import { getMaxLiquidationLeverage } from "../../../query/vault/getMaxLiquidationLeverage";
import { ChainId, TokenInfo } from "../../../types";
import { Position } from "../../../types/position";
import { parseValue } from "../../../utils/numbers/parseValue";
import { getLiqPrice } from "../../../utils/position";
import { OrderType } from "../../orders/types/orderType";
import { getEntryPrice } from "../../utils/entryPrice";
import { getFromUsdMin } from "../../utils/getFromUsdMin";
import { getMarginFeeBasisPoints } from "../../../query/marginFeeBasisPoints";
import { getToUsdMax } from "../../utils/toValue";
import { getNextAveragePrice } from "./getNextAveragePrice";
import { cacheKeys, getDataWithCache } from "../../../cache";

export const getLiquidationPrice = async ({
  chainId,
  triggerExecutionPrice,
  transactionAmount,
  fromToken,
  toToken,
  isLongPosition,
  collateralTokenInfo,
  existingPosition,
  orderType,
  leverageRatio,
  caches,
}: {
  chainId: ChainId;
  fromToken: TokenInfo;
  transactionAmount: string;
  toToken: TokenInfo;
  orderType: OrderType;
  isLongPosition: boolean;
  collateralTokenInfo: TokenInfo;
  leverageRatio?: number;
  triggerExecutionPrice?: string;
  existingPosition?: Position;
  caches: Map<string, any>;
}) => {
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );
  const maxLiquidationLeverage = await getDataWithCache(
    caches,
    cacheKeys.MaxLiquidationLeverage,
    getMaxLiquidationLeverage,
    chainId
  );
  const fixedLiquidationFeeUsd = await getDataWithCache(
    caches,
    cacheKeys.FixedLiquidationFeeUsd,
    getFixedLiquidationFeeUsd,
    chainId
  );

  const fromAmount = parseValue(transactionAmount, fromToken.decimals);
  const nextAveragePrice = await getNextAveragePrice({
    chainId: chainId,
    existingPosition: existingPosition,
    fromTokenInfo: fromToken,
    fromAmount,
    toTokenInfo: toToken,
    triggerExecutionPrice: triggerExecutionPrice,
    orderType: orderType,
    isLong: isLongPosition,
    collateralTokenInfo: collateralTokenInfo,
    leverage: leverageRatio,
    caches,
  });

  const triggerPrice = parseValue(triggerExecutionPrice ?? "0", USD_DECIMALS);

  const toUsdMax = await getToUsdMax(
    chainId,
    fromToken,
    fromAmount,
    toToken,
    triggerPrice,
    orderType,
    isLongPosition,
    collateralTokenInfo,
    caches,
    undefined,
    leverageRatio
  );

  const fromUsdMin = getFromUsdMin(fromToken, fromAmount);

  const nextLiqPrice =
    !existingPosition || !nextAveragePrice
      ? undefined
      : getLiqPrice(
          {
            isLong: isLongPosition,
            size: existingPosition.size,
            collateral: existingPosition.collateral,
            averagePrice: nextAveragePrice,
            entryFundingRate: existingPosition.entryFundingRate,
            cumulativeFundingRate: existingPosition.cumulativeFundingRate,
            sizeDelta: toUsdMax,
            collateralDelta: fromUsdMin,
            isIncreaseCollateral: true,
            isIncreaseSize: true,
            maxLiquidationLeverage,
            fixedLiquidationFeeUsd,
            marginFeeBasisPoints,
          },
          chainId
        );
  if (existingPosition) {
    return nextLiqPrice?.toBigInt();
  }

  const entryPrice = getEntryPrice(
    toToken,
    triggerPrice,
    orderType,
    isLongPosition
  );
  return getLiqPrice(
    {
      isLong: isLongPosition,
      size: BIG_NUM_ZERO,
      collateral: BIG_NUM_ZERO,
      sizeDelta: toUsdMax,
      isIncreaseSize: true,
      collateralDelta: fromUsdMin,
      isIncreaseCollateral: true,
      averagePrice: entryPrice,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints,
    },
    chainId
  )?.toBigInt();
};
