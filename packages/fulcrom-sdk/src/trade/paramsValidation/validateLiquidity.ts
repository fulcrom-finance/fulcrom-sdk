import {
  expandDecimals,
  ONE_USD,
  USD_DECIMALS,
  USDG_DECIMALS,
} from "../../config";
import { CachesMap, ChainId, TokenInfo, ValidationParams } from "../../types";
import { getMaxAvailableShort } from "../../utils/getMaxAvailableShort";
import { parseValue } from "../../utils/numbers/parseValue";
import { getFromUsdMin } from "../utils/getFromUsdMin";
import { getIsNeedSwap } from "../utils/getIsNeedSwap";
import { getNextToAmount } from "../utils/nextToAmount";
import { OrderType } from "../orders/types/orderType";
import { getToUsdMax } from "../utils/toValue";
import { BigNumber } from "@ethersproject/bignumber";

const liquidityForLeverageValidator = async ({
  chainId,
  fromTokenInfo,
  fromAmount,
  toTokenInfo,
  triggerPrice,
  orderType,
  isLong,
  collateralTokenInfo,
  caches,
  leverage,
  precision,
}: {
  chainId: ChainId;
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo; //to token symbol
  isLong: boolean; //is long or short
  collateralTokenInfo: TokenInfo; //collateral token
  orderType: OrderType; //tradeType: Market/Limit/StopMarket
  // if StopMarket/LimitOrder
  triggerPrice: BigNumber; //trigger price
  caches: CachesMap<any>;
  // options
  leverage?: number; //leverage
  precision?: number; //precision
}) => {
  const toUsdMax = await getToUsdMax(
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
  /** liquidity validation for leverage - long **/
  if (isLong) {
    if (toUsdMax.gt(toTokenInfo.maxAvailableLong))
      return [`Max ${toTokenInfo.displaySymbol} long exceeded`];
  }

  /** liquidity validation for leverage - short **/
  if (!isLong) {
    const maxAvailableShort = getMaxAvailableShort(
      toTokenInfo,
      collateralTokenInfo
    );

    if (toUsdMax.gt(maxAvailableShort))
      return [`Max ${toTokenInfo.displaySymbol} short exceeded`];
  }

  return [];
};

const liquidityForSwapValidator = async ({
  chainId,
  isLong,
  fromTokenInfo,
  fromAmount,
  triggerPrice,
  toTokenInfo,
  orderType,
  collateralTokenInfo,
  caches,
  leverage,
  precision,
}: {
  chainId: ChainId;
  fromTokenInfo: TokenInfo;
  fromAmount: BigNumber;
  toTokenInfo: TokenInfo; //to token symbol
  isLong: boolean; //is long or short
  collateralTokenInfo: TokenInfo; //collateral token
  orderType: OrderType; //tradeType: Market/Limit/StopMarket
  // if StopMarket/LimitOrder
  triggerPrice: BigNumber; //trigger price
  caches: CachesMap<any>;
  // options
  leverage?: number; //leverage
  precision?: number; //precision
}) => {
  const fromUsdMin = getFromUsdMin(fromTokenInfo, fromAmount);
  const isNeedSwap = getIsNeedSwap({
    isLong,
    fromToken: fromTokenInfo,
    toTokenInfo,
    collateralTokenInfo,
  });
  const toAmount = await getNextToAmount(
    chainId,
    fromTokenInfo,
    fromAmount,
    toTokenInfo,
    triggerPrice,
    orderType,
    isLong,
    collateralTokenInfo,
    caches,
    leverage,
    precision
  );
  const toUsdMax = await getToUsdMax(
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

  /** liquidity validation for swap - long **/
  if (isLong && isNeedSwap && toTokenInfo.maxPrice.gt(0)) {
    // to simplify the calculation, we can safely ignore the swap fee here
    const swapAmount = fromUsdMin
      .mul(expandDecimals(toTokenInfo.decimals))
      .div(toTokenInfo.maxPrice);

    const requiredAmount = toAmount?.add(swapAmount);

    if (
      requiredAmount?.gt(toTokenInfo.availableAmount) ||
      toTokenInfo.bufferAmount.gt(toTokenInfo.poolAmount.sub(swapAmount))
    )
      return ["Insufficient liquidity"];

    const usdgFromAmount = fromUsdMin
      .mul(expandDecimals(USDG_DECIMALS))
      .div(ONE_USD);

    const nextUsdgAmount = fromTokenInfo.usdgAmount.add(usdgFromAmount);

    if (nextUsdgAmount.gt(fromTokenInfo.maxUsdgAmount))
      return [
        `${fromTokenInfo.displayDecimals} pool exceeded, try different pay token`,
      ];
  }

  /** liquidity validation for swap - short **/
  if (!isLong && isNeedSwap && toTokenInfo.maxPrice.gt(0)) {
    // to simplify the calculation, we can safely ignore the swap fee here
    const swapAmount = fromUsdMin
      .mul(expandDecimals(collateralTokenInfo.decimals))
      .div(collateralTokenInfo.maxPrice);

    // position sizeDelta in collateral token
    const sizeDelta = toUsdMax
      .mul(expandDecimals(collateralTokenInfo.decimals))
      .div(collateralTokenInfo.minPrice);

    const requiredAmount = swapAmount.add(sizeDelta);

    if (
      requiredAmount.gt(collateralTokenInfo.availableAmount) ||
      collateralTokenInfo.bufferAmount.gt(
        collateralTokenInfo.poolAmount.sub(swapAmount)
      )
    )
      return ["Insufficient liquidity"];

    const usdgFromAmount = fromUsdMin
      .mul(expandDecimals(USDG_DECIMALS))
      .div(ONE_USD);
    const nextUsdgAmount = fromTokenInfo.usdgAmount.add(usdgFromAmount);

    if (nextUsdgAmount.gt(fromTokenInfo.maxUsdgAmount))
      return [
        `${fromTokenInfo.displayDecimals} pool exceeded, try different pay token`,
      ];
  }
  return [];
};

export const validateLiquidity = async (params: ValidationParams) => {
  const liquidityForLeverageMsg = await liquidityForLeverageValidator({
    chainId: params.chainId,
    fromTokenInfo: params.fromToken,
    fromAmount: parseValue(params.transactionAmount, params.fromToken.decimals),
    toTokenInfo: params.toToken,
    triggerPrice: parseValue(params.triggerExecutionPrice ?? "0", USD_DECIMALS),
    orderType: params.orderType,
    isLong: params.isLongPosition,
    caches: params.caches,
    collateralTokenInfo: params.collateralTokenInfo,
    leverage: params.leverageRatio,
  });
  const liquidityForSwapMsg = await liquidityForSwapValidator({
    chainId: params.chainId,
    fromTokenInfo: params.fromToken,
    fromAmount: parseValue(params.transactionAmount, params.fromToken.decimals),
    toTokenInfo: params.toToken,
    triggerPrice: parseValue(params.triggerExecutionPrice ?? "0", USD_DECIMALS),
    orderType: params.orderType,
    isLong: params.isLongPosition,
    caches: params.caches,
    collateralTokenInfo: params.collateralTokenInfo,
    leverage: params.leverageRatio,
  });

  return [...liquidityForLeverageMsg, ...liquidityForSwapMsg];
};
