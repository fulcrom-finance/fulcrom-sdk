import { BigNumber } from "@ethersproject/bignumber";
import { USD_DECIMALS } from "../../../../../config";
import { BIG_NUM_ZERO } from "../../../../../config/zero";
import { IncreaseOrder } from "../../../../../query/graphql";
import { getFixedLiquidationFeeUsd } from "../../../../../query/vault/getFixedLiquidationFeeUsd";
import { getMaxLiquidationLeverage } from "../../../../../query/vault/getMaxLiquidationLeverage";
import { ChainId, TokenInfo } from "../../../../../types";
import { Position } from "../../../../../types/position";
import { parseValue } from "../../../../../utils/numbers/parseValue";
import { getLiqPrice } from "../../../../../utils/position";
import { getFromUsdMin } from "../../../../utils/getFromUsdMin";
import { getMarginFeeBasisPoints } from "../../../../../query/marginFeeBasisPoints";
import { getEditIncOrderNextAveragePrice } from "./getEditIncOrderNextAveragePrice";
import { cacheKeys, getDataWithCache } from "../../../../../cache";

export const getEditIncOrderLiqPrice = async ({
  chainId,
  order,
  triggerExecutionPrice,
  transactionAmount,
  fromTokenInfo,
  position,
  caches,
}: {
  chainId: ChainId;
  order: IncreaseOrder;
  triggerExecutionPrice: string;
  transactionAmount: string;
  fromTokenInfo: TokenInfo;
  position?: Position;
  caches: Map<string, any>;
}) => {
  const hasExistingPosition = !!position;

  const triggerPrice = parseValue(triggerExecutionPrice, USD_DECIMALS);
  const hashInput = triggerPrice.gt(0);

  const toUsdMax = parseValue(transactionAmount, USD_DECIMALS);
  const fromUsdMin = getFromUsdMin(fromTokenInfo, order.purchaseTokenAmount);
  const isLong = order.isLong;

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
  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    chainId
  );

  const isShowNextAmount = hasExistingPosition && hashInput;

  const nextLiqPrice = getEditIncOrderNextLiqPrice({
    chainId,
    order,
    triggerExecutionPrice,
    transactionAmount,
    fromTokenInfo,
    position,
    maxLiquidationLeverage,
    fixedLiquidationFeeUsd,
    marginFeeBasisPoints,
  });
  if (isShowNextAmount) {
    return nextLiqPrice?.toBigInt();
  }

  return getLiqPrice(
    {
      isLong,
      size: BIG_NUM_ZERO,
      collateral: BIG_NUM_ZERO,
      sizeDelta: toUsdMax,
      isIncreaseSize: true,
      collateralDelta: fromUsdMin,
      isIncreaseCollateral: true,
      averagePrice: triggerPrice,
      maxLiquidationLeverage,
      fixedLiquidationFeeUsd,
      marginFeeBasisPoints,
    },
    chainId
  )?.toBigInt();
};

export const getEditIncOrderNextLiqPrice = ({
  chainId,
  order,
  triggerExecutionPrice,
  transactionAmount,
  fromTokenInfo,
  position,
  maxLiquidationLeverage,
  fixedLiquidationFeeUsd,
  marginFeeBasisPoints,
}: {
  chainId: ChainId;
  order: IncreaseOrder;
  triggerExecutionPrice: string;
  transactionAmount: string;
  fromTokenInfo: TokenInfo;
  maxLiquidationLeverage: BigNumber;
  fixedLiquidationFeeUsd: BigNumber;
  marginFeeBasisPoints: number;
  position?: Position;
}) => {
  const isLong = order.isLong;

  const nextAveragePrice = getEditIncOrderNextAveragePrice(
    order,
    triggerExecutionPrice,
    transactionAmount,
    position
  );
  const fromUsdMin = getFromUsdMin(fromTokenInfo, order.purchaseTokenAmount);
  const toUsdMax = parseValue(transactionAmount, USD_DECIMALS);

  if (!position || !nextAveragePrice) return undefined;

  const nextLiqPrice = getLiqPrice(
    {
      isLong,
      size: position.size,
      collateral: position.collateral,
      averagePrice: nextAveragePrice,
      entryFundingRate: position.entryFundingRate,
      cumulativeFundingRate: position.cumulativeFundingRate,
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

  return nextLiqPrice;
};
