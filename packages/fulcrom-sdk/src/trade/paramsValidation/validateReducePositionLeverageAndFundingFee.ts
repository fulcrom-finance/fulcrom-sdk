import {
  BASIS_POINTS_DIVISOR,
  expandDecimals,
  getContractAddress,
  USD_DECIMALS,
} from "../../config";
import { getPosition } from "../../positions/getPosition";
import { getTotalSupply } from "../../query/erc20/totalSupply";
import { getTotalWeight } from "../../query/totalWeight";
import { Address, ChainId, ValidationParams } from "../../types";
import {
  getCanCollateralAffordFundingFee,
  getCollateralThreshold,
  getDepositFee,
} from "../../utils/fee";
import { getNextLeverage } from "../../utils/getNextLeverage";
import { getNonZeroDecimalsPlaces } from "../../utils/getNonZeroDecimalsPlaces";
import { formatAmount } from "../../utils/numbers/formatAmount";
import { parseValue } from "../../utils/numbers/parseValue";
import { getFromUsdMin } from "../utils/getFromUsdMin";
import { getMarginFeeBasisPoints } from "../../query/marginFeeBasisPoints";
import { getMaxSwapFeeBps } from "../utils/maxSwapFeeBps";
import { isStopOrLimitOrder } from "../orders/types/orderType";
import { getMarginFee } from "../utils/position";
import { getToUsdMax } from "../utils/toValue";
import { cacheKeys, getDataWithCache } from "../../cache";

export const validateReducePositionLeverageAndFundingFee = async (
  params: ValidationParams
) => {
  const positionParams: {
    account: Address;
    toToken: Address;
    collateralTokenAddress?: Address;
    isLong: boolean;
    chainId: ChainId;
    caches: Map<string, any>;
  } = {
    account: params.account,
    toToken: params.toToken.address,
    isLong: params.isLongPosition,
    chainId: params.chainId,
    caches: params.caches,
  };
  if (params.isLongPosition) {
    positionParams.collateralTokenAddress = params.toToken.address;
  } else {
    if (!params.collateralTokenSymbol) {
      return ["collateralTokenSymbol is required for short position"];
    }
    const collateralToken = params.collateralTokenInfo;
    positionParams.collateralTokenAddress = collateralToken?.address;
  }

  const errorMsg = [];
  const existingPosition = await getPosition(positionParams);
  const nextLeverage = await getNextLeverage({
    chainId: params.chainId,
    existingPosition,
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

  if (
    params.isLongPosition &&
    isStopOrLimitOrder(params.orderType) && // for stop market apply the same
    existingPosition &&
    nextLeverage &&
    nextLeverage.lte(existingPosition.leverage)
  )
    errorMsg.push(
      "Order cannot be executed as it would reduce the position's leverage"
    );

  if (!existingPosition || !nextLeverage) return errorMsg;

  const indexToken = params.toToken;
  if (!indexToken) return errorMsg;
  const collateralUsd = getFromUsdMin(
    params.fromToken,
    parseValue(params.transactionAmount, params.fromToken.decimals)
  );
  const collateralAmount = parseValue(
    params.transactionAmount,
    params.fromToken.decimals
  );
  const sizeDelta = await getToUsdMax(
    params.chainId,
    params.fromToken,
    collateralAmount,
    params.toToken,
    parseValue(params.triggerExecutionPrice ?? "0", USD_DECIMALS),
    params.orderType,
    params.isLongPosition,
    params.fromToken,
    params.caches,
    undefined,
    params.leverageRatio
  );
  const currentLeverage = existingPosition.leverage.toBigInt();
  const isLong = existingPosition.isLong;
  const depositFee = getDepositFee({
    isLeverageDecreased: nextLeverage?.toBigInt() < currentLeverage,
    isLong,
    userPayAmount: collateralUsd,
  });
  const usdgSupply = await getDataWithCache(
    params.caches,
    cacheKeys.UsdgSypply,
    getTotalSupply,
    params.chainId,
    getContractAddress("USDG", params.chainId)
  );

  const totalWeight = await getDataWithCache(
    params.caches,
    cacheKeys.TotalWeight,
    getTotalWeight,
    params.chainId
  );

  const swapFeeBps = getMaxSwapFeeBps({
    fromAmount: collateralAmount,
    fromTokenInfo: params.fromToken,
    toTokenInfo: indexToken,
    totalWeight,
    usdgSupply,
  });

  const swapFee = collateralUsd.mul(swapFeeBps).div(BASIS_POINTS_DIVISOR);
  const poolAmountUsd = indexToken.poolAmount
    .mul(indexToken.minPrice)
    .div(expandDecimals(indexToken.decimals));
  const reservedAmountUsd = indexToken.reservedAmount
    .mul(indexToken.minPrice)
    .div(expandDecimals(indexToken.decimals));

  const marginFeeBasisPoints = await getDataWithCache<number, [ChainId]>(
    params.caches,
    cacheKeys.MarginFeeBasisPoints,
    getMarginFeeBasisPoints,
    params.chainId
  );

  const marginFee = getMarginFee(sizeDelta, marginFeeBasisPoints);
  const fundingFee = existingPosition.fundingFee;

  const canAfford = getCanCollateralAffordFundingFee({
    collateral: collateralUsd,
    depositFee,
    swapFee,
    fundingFee,
    marginFee: marginFee,
    poolAmount: poolAmountUsd,
    reservedAmount: reservedAmountUsd,
  });
  const collateralThreshold = getCollateralThreshold({
    depositFee,
    swapFee,
    fundingFee,
    marginFee: marginFee,
    poolAmount: poolAmountUsd,
    reservedAmount: reservedAmountUsd,
  });
  const collateralTokenThreshold = collateralThreshold
    .mul(expandDecimals(params.fromToken.decimals))
    .div(params.fromToken.minPrice);

  if (!canAfford) {
    errorMsg.push(
      `Please input collateral more than ${formatAmount(
        collateralTokenThreshold,
        {
          decimals: params.fromToken.decimals,
          displayDecimals: getNonZeroDecimalsPlaces(
            collateralTokenThreshold,
            params.fromToken.decimals
          ),
          round: true,
        }
      )} ${params.fromToken.displaySymbol} to cover funding fee`
    );
  }
  return errorMsg;
};
