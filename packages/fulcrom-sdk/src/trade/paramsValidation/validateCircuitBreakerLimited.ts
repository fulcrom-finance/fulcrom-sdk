import { BigNumber } from "@ethersproject/bignumber";
import { getToUsdMax } from "../utils/toValue";
import { ChainId, TokenInfo, ValidationParams } from "../../types";
import { OrderType } from "../orders/types/orderType";
import { getCircuitBreakerTokenInfoMap } from "../../query/circuitBreaker/getCircuitBreakerTokenInfoMap";
import { getOIRatioCheckThreshold } from "../../query/circuitBreaker/getOIRatioCheckThreshold";
import { parseValue } from "../../utils/numbers/parseValue";
import { USD_DECIMALS } from "../../config";

type ParamsType = {
  chainId: ChainId;
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo; //to token symbol
  isLong: boolean; //is long or short
  collateralTokenInfo: TokenInfo; //collateral token
  orderType: OrderType; //tradeType: Market/Limit/StopMarket
  // if StopMarket/LimitOrder
  triggerPrice: BigNumber; //trigger price
  caches: Map<string, any>; //caches
  // options
  leverage?: number; //leverage
  precision?: number; //precision
};

const isCircuitBreakerCheckInValid = ({
  isLong,
  currentLongOI,
  currentShortOI,
  positionSize,
  oiRatioCheckThreshold,
  maxLongToShortRatio,
  maxShortToLongRatio,
}: {
  isLong: boolean;
  currentLongOI: BigNumber;
  currentShortOI: BigNumber;
  positionSize: BigNumber;
  oiRatioCheckThreshold: BigNumber;
  maxLongToShortRatio: BigNumber;
  maxShortToLongRatio: BigNumber;
}) => {
  if (isLong) {
    // long position
    if (
      currentLongOI.add(positionSize).gt(oiRatioCheckThreshold) &&
      !maxLongToShortRatio.isZero() &&
      currentLongOI
        .add(positionSize)
        .gt(currentShortOI.mul(maxLongToShortRatio).div(100)) // maxLongToShortRatio decimals is 100
    ) {
      return true;
    }
  } else {
    // short position
    if (
      currentShortOI.add(positionSize).gt(oiRatioCheckThreshold) &&
      !maxShortToLongRatio.isZero() &&
      currentShortOI
        .add(positionSize)
        .gt(currentLongOI.mul(maxShortToLongRatio).div(100)) // maxShortToLongRatio decimals is 100
    ) {
      return true;
    }
  }

  return false;
};

const getIsCircuitBreakerLimited = async ({
  chainId,
  fromTokenInfo,
  fromAmount,
  toTokenInfo,
  triggerPrice,
  orderType,
  isLong,
  collateralTokenInfo,
  leverage,
  precision,
  caches,
}: ParamsType) => {
  const positionSize = await getToUsdMax(
    chainId,
    fromTokenInfo,
    fromAmount,
    toTokenInfo,
    triggerPrice,
    orderType,
    isLong,
    collateralTokenInfo,
    caches,
    precision,
    leverage
  );

  const circuitBreakerTokenInfoMap = await getCircuitBreakerTokenInfoMap({
    chainId,
    tokenAddress: toTokenInfo.address,
  });

  const oiRatioCheckThreshold = await getOIRatioCheckThreshold(
    chainId,
    toTokenInfo.address
  );

  if (!circuitBreakerTokenInfoMap || !toTokenInfo || !oiRatioCheckThreshold)
    return false;

  const { guaranteedUsd: currentLongOI, globalShortSize: currentShortOI } =
    toTokenInfo;

  const { maxLongToShortRatio, maxShortToLongRatio } =
    circuitBreakerTokenInfoMap;

  if (
    !currentLongOI ||
    !currentShortOI ||
    !maxLongToShortRatio ||
    !maxShortToLongRatio ||
    positionSize.isZero()
  )
    return false;

  return isCircuitBreakerCheckInValid({
    isLong,
    currentLongOI,
    currentShortOI,
    positionSize,
    oiRatioCheckThreshold,
    maxLongToShortRatio,
    maxShortToLongRatio,
  });
};

export const validateCircuitBreakerLimited = async (
  params: ValidationParams
) => {
  const isCircuitBreakerLimited = await getIsCircuitBreakerLimited({
    chainId: params.chainId,
    fromTokenInfo: params.fromToken,
    fromAmount: parseValue(params.transactionAmount, params.fromToken.decimals),
    toTokenInfo: params.toToken,
    triggerPrice: parseValue(params.triggerExecutionPrice ?? "0", USD_DECIMALS),
    orderType: params.orderType,
    isLong: params.isLongPosition,
    collateralTokenInfo: params.collateralTokenInfo,
    leverage: params.leverageRatio,
    caches: params.caches,
  });

  if (isCircuitBreakerLimited) {
    return [
      `New ${params.toToken.displaySymbol} ${
        params.isLongPosition ? "long" : "short"
      } order temporarily paused due to current market volatility.`,
    ];
  }

  return [];
};
